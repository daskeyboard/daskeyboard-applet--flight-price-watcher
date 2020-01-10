const q = require('daskeyboard-applet');
const request = require('request-promise');
const fs = require('fs');
const logger = q.logger;

var airports = null;

// Check the price of a selected flight every minute in order to buy it at the best price.
// Compare the current price with the first price stored when the applet has been loaded.
// (This first price is saved during 24 hours).

class FlightPriceWatcher extends q.DesktopApp {

	constructor() {
		super();
		// every minute
		this.pollingInterval = 60 * 1000; // ms
		logger.info("FlightPriceWatcher starting: Get the cheapest flight price!");
		// The store is reset eveytime the applet is reload.
		this.store.clear();
	}

	async getPrice() {
		// Get the current price of the selected flight. 
		logger.info(`Getting price`);
		const API_BASE_URL = `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices`;
		const API_WORLD_URL = `browsequotes/v1.0/US/${this.config.currency}/en-US`;
		const place = `${this.config.originPlace}-sky/${this.config.destinationPlace}-sky`;
		const date = `${this.config.departDate}?inboundpartialdate=${this.config.returnDate}`;
		const settings = {
			url: `${API_BASE_URL}/${API_WORLD_URL}/${place}/${date}`,
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
			if (json.Quotes.length == 0) {
				return null;
			}
			// Collects the first element of "Quotes" corresponding 
			// to the minprice for the selected flight.
			return json.Quotes[0].MinPrice;
		});
	}

	// Search method linked to a JSON file for the airport name input in the form.
	// The JSON file holds the IATA code and the name of the airports
	async options(fieldId, search) {
		// const API_BASE_URL = `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices`;
		if (airports) {
			logger.info("Sending preloaded airports");
			return this.getIATA(airports, search);
		} else if (fs.existsSync('./airports.json')) {
			logger.info('Loading places from a file.');
			const airports = require('./airports.json');
			return this.getIATA(airports, search);
		}
	}

	/**
	* @param {*} airports
	* @param {String} search 
	*/
	async getIATA(airports, search) {
		if (search != null) {
			search = search.trim().toLowerCase();
		}
		let option = [];
		for (const airport of airports) {
			const key = airport.iata;
			let value = airport.name || '';
			if (!search || value.toLowerCase().includes(search)) {
				option.push({
					key: key,
					value: value
				});
			}	
		}
		return option;
	}	

	// Store price obtained from first loaded.
	// The price is updated every 24 hours.
	// This price is compared with the price collected from the API every minute.
	setFirstPrice(price) {
		const firstPriceDate = this.store.get("firstPriceDate");
		if(firstPriceDate == null || new Date().getTime() - firstPriceDate > 24*3600*1000) {
			this.store.put("firstPrice", price);
			this.store.put("firstPriceDate", new Date().getTime());
		}
		return true;
	}

	// Retrieve stored price data.
	getFirstPrice() {
		return this.store.get("firstPrice");
	}

	async run() {
		// Compare the current price to the first price
		return this.getPrice().then(new_price => {
			this.setFirstPrice(new_price);
			const first_price = this.getFirstPrice();
			logger.info(`The new price is ${new_price}`);
			logger.info(`The first price is ${first_price}`);
			logger.info(`The threshold is ${this.config.threshold}`);
			let color;
			let message;
			// If there is no flight listed.
			if (new_price == null) {
				color = '#DF0101'; // red
				message = `This flight is not listed. Please modify your request.`;
			}
			else if (new_price <= this.config.threshold) {
				if (first_price == null) {
					color = '#FFFF00'; // yellow
					message = `The best price for this flight: from ${this.config.originPlace}
					to ${this.config.destinationPlace} the ${this.config.departDate} is 
					${new_price} ${this.config.currency}.`;
				} else if (new_price <= first_price) {
					color = '#088A08'; // green
					message = `The best price for this flight: from ${this.config.originPlace}
					to ${this.config.destinationPlace} the ${this.config.departDate} is 
					${new_price} ${this.config.currency}. Let's buy it!`;
				} else {
					color = '#FFFF00'; // yellow
					message = `The best price for this flight: from ${this.config.originPlace}
					to ${this.config.destinationPlace} the ${this.config.departDate}
					was ${first_price} ${this.config.currency} 
					and is now ${new_price} ${this.config.currency}`;
				}
			} else {
				if (first_price == null) {
					color = '#FF8000'; // orange
					message = `The best price for this flight: from ${this.config.originPlace}
					to ${this.config.destinationPlace} the ${this.config.departDate} is 
					${new_price} ${this.config.currency}.`;
				} else if (new_price <= first_price) {
					color = '#FF8000'; // orange
					message = `The best price for this flight: from ${this.config.originPlace}
					to ${this.config.destinationPlace} the ${this.config.departDate} is 
					${new_price} ${this.config.currency}. Let's buy it!`;
				} else {
					color = '#DF0101'; // red
					message = `The best price for this flight: from ${this.config.originPlace}
					to ${this.config.destinationPlace} the ${this.config.departDate}
					was ${first_price} ${this.config.currency} 
					and is now ${new_price} ${this.config.currency}`;
				}
			}
			const a = new q.Signal({
				points: [
					[new q.Point(color)]
				],
				name: 'FlightPriceWatcher',
				message: message,
				errors: 'Error signal'
			});
			return a;
		})
	}

	isDateFormatValid(date) {
		var regEx = /^\d{4}-\d{2}-\d{2}$/;	
		if(!date || date.match(regEx)) {
			return true; //Valid format
		} else {
			return false;  // Invalid format
		}
	}

	isThresholdFormatValid(price) {
		var regEx = /^[0-9]*$/;
		if(!price || price.match(regEx)) {
			return true; // Valid format
		} else {
			return false; // Invalid format
		}
	}

	async applyConfig() {	
		if (!this.isDateFormatValid(this.config.departDate)) {
			throw new Error('Depart date format invalid');
		} else if (!this.isDateFormatValid(this.config.returnDate)) {
			throw new Error('Return date format invalid');
		} else if (!this.isThresholdFormatValid(this.config.threshold)) {
			throw new Error('Threshold format invalid');
		}
		// The value in the store is reset when the user changes the configuration
		// of the applet, for example if he wants to change the originPlace or whatever
		this.store.clear();
	}
}

module.exports = {
	FlightPriceWatcher: FlightPriceWatcher
}

new FlightPriceWatcher();