import puppeteer from "puppeteer";

export var QuerySelectors = function() {
    this.list = null;
    this.name = null;
    this.price = null;
    this.stock = null;
    this.href = null;
};

export class PuppeteerScraper {    
    constructor(url, query_selector, timeout = 1000) {
        this.url = url;
        this.query_selector = query_selector;
        this.timeout = timeout;
    }

    getListItemInformation = async () => {
        try {
            const browser = await puppeteer.launch({
                headless: true,
                defaultViewport: null,
            });

            // Navigate to page
            const page = await browser.newPage();
            await page.goto(this.url, {waitUntil: "domcontentloaded"})

            // Get product pages
            // Example: Page with multiple products 
            const items = await page.evaluate((query_selector) => {
                let arr = [];
                const itemList = document.querySelectorAll(query_selector.list);
                
                for(let i = 0; i < itemList.length; i++) {
                    var current = {
                        href: "",
                        name: "",
                        description: "",
                        price: "",
                        stock: ""
                    };
                    
                    try {
                        current.href = itemList[i].querySelector(query_selector.href).href;
                    }
                    catch (error) {
                        current.href = "";
                    }

                    arr.push(current);
                }

                return arr;
            }, this.query_selector);
            
            // Navigate to each page
            for (let i = 0; i < items.length; i++) {
                try {
                    await page.goto(items[i].href, {waitUntil: "domcontentloaded"});
                    await new Promise(r => setTimeout(r, this.timeout));

                    const product_info = await page.evaluate((query_selector) => {
                        var info = {
                            name: "",
                            description: "",
                            price: "",
                            stock: ""
                        }

                        try {
                            info.name = document.querySelector(query_selector.name).innerText;
                        }
                        catch (error) {
                            info.name = "";
                        }

                        try {
                            info.description = document.querySelector(query_selector.description).innerText;
                        }
                        catch (error) {
                            info.description = "";
                        }

                        try {
                            info.price = document.querySelector(query_selector.price).innerText;
                        }
                        catch (error) {
                            info.price = "";
                        }

                        try {
                            info.stock = document.querySelector(query_selector.stock).innerText;
                        }
                        catch (error) {
                            info.stock = "";
                        }

                        return info;
                    }, this.query_selector);
                    items[i].name = product_info.name;
                    items[i].description = product_info.description;
                    items[i].price = product_info.price;
                    items[i].stock = product_info.stock;

                    console.log(`Item grabbed: ${items[i].name}`);
                }
                catch(error) {
                    console.error(error);
                }
            }
            await browser.close();

            return items;
        }
        catch (error) {
            console.error(error);
            return;
        }
    }
}