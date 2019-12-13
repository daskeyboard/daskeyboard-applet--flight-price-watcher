const q = require('daskeyboard-applet');
const request = require('request-promise');
const logger = q.logger; 

// Check the price of a selected flight every minute in order to buy it at the best price
// Compare the current price to the old price stored one minute ago

class FlightPriceWatcher extends q.DesktopApp {
	
    constructor() {
        super();
        // every minute
        this.pollingInterval = 60*1000; // ms
		logger.info("FlightPriceWatcher starting: Get the cheapest flight price!");
	}
	async getPrice() {
		// Get the current price of the selected flight 
		logger.info(`Getting price`);
		const API_BASE_URL = `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices`;
		const settings = {
			url: `${API_BASE_URL}/browsequotes/v1.0/US/USD/en-US/${this.config.originPlace}-sky/${this.config.destinationPlace}-sky/${this.config.departDate}?inboundpartialdate=${this.config.returnDate}`,
			method: 'GET',
			headers: {
				'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com',
                'x-rapidapi-key': this.authorization.apiKey 
			}
        }
        if (!this.authorization.apiKey) {
            throw 'Invalid API key';
        }
		return request(settings).then(answer => {
			const json = JSON.parse(answer);
			if(json.Quotes.length == 0) {
				return null;
			}
            return json.Quotes[0].MinPrice;
        // }).catch(error=>{
        //     console.log(error, "ERRROR!!!");
        });
    }
	// Store price obtained from last update
	setLastPrice(price) {
		this.store.put("lastPrice", price);
		return true;
	}
	// Retrieve stored price data from last update
	getLastPrice() {
		if (this.store.get("lastPrice") != null){
			return this.store.get("lastPrice");
		} else {
			// If no price is stored
			return null;
		}
	}
    async run() {
		// Compare the current price to the old price
		return this.getPrice().then(new_price => {
			const old_price = this.getLastPrice();
			logger.info(new_price);
			logger.info(old_price);
			let color;
			let message;
			// If there is no price stored in localStorage
			if (old_price == null) {
				color = '#000000'; // black
				message = `The best price for this flight is ${new_price}$.`;			
			} 
			else if (new_price <= old_price) {
				color = '#088A08'; // green
				message = `The best price for this flight is ${new_price}$.`;
				} 
			else if (new_price > old_price) {
				color = '#DF0101'; // red
				message = `Unfortunately, the best price for this flight was ${old_price}$. Now the price is ${new_price}$`;
				}
			const a = new q.Signal({
				points: [
					[new q.Point(color)]
				],
				name: 'FlightPriceWatcher',
                message: message,
                errors: 'Error signal'
			});
			this.setLastPrice(new_price);
			return a;
		})
	}
}

module.exports = {
	FlightPriceWatcher: FlightPriceWatcher
}

const applet = new FlightPriceWatcher();
