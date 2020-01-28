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

	settings() {
		const API_BASE_URL = `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices`;
		const API_WORLD_URL = `browsequotes/v1.0/US/${this.config.currency}/en-US`;
		const place = `${this.config.departurePlace}-sky/${this.config.destinationPlace}-sky`;
		const date = `${this.config.departureDate}`;
		const response = {
			url: `${API_BASE_URL}/${API_WORLD_URL}/${place}/${date}`,
			method: 'GET',
			headers: {
				'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com',
				'x-rapidapi-key': this.authorization.apiKey
			}
		}
		return response;

	}

	async getPrice() {
		// Get the current price of the selected flight. 
		logger.info(`Getting price`);
		const settings = this.settings();
		if (!this.authorization.apiKey) {
			throw 'Missing API key';
		}
		return new Promise((resolve, reject) => request(settings, (error, response, answer) => {
			const priceFromApi = JSON.parse(answer);
			// 429 means quota exceeded
			if (response.statusCode == 429) {
				reject(`Quota exceeded`);
			}
			// If no prices are listed
			// It will display `This flight is not listed. Please modify your request.` 
			// See the logic line 118
			if (priceFromApi.Quotes.length == 0) {
				resolve(null);
			}
			// Collects the first element of "Quotes" corresponding 
			// to the minprice for the selected flight.
			resolve(priceFromApi.Quotes[0].MinPrice);
		}));
	}

	// This search input allows the user to find easily the name of an airport. 
	// The user starts to write the name of a city or an airport he needs, then
	// the search input will show him the different airports linked to his input.
	// It is a search method linked to a JSON file that holds the IATA code and the name
	// of the airports we need.
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

	// Parameters needed to create the search method and collect the right datas: IATAs and names of
	// the airports.
	/**
	* @param {*} airports // contains datas
	* @param {String} search // method
	*/
	async getIATA(airports, search) {
		if (search != null) {
			search = search.trim().toLowerCase();
		}
		let option = [];
		for (const airport of airports) {
			// Datas needed: the user will enter the name of the airport (value) which is
			// linked to the IATA (key).
			// The IATA is needed cause it will be added in the API url to allow the
			// collect of the price.
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

	// Stored price obtained from first load and every 24 hours.
	// The price is updated every 24 hours.
	// This price is compared with the price collected from the API every minute.
	storeFirstPriceOfTheDayIfNeeded(price) {
		const firstPriceDate = this.store.get("firstPriceDate");
		if (firstPriceDate == null || new Date().getTime() - firstPriceDate > 24 * 3600 * 1000) {
			this.store.put("firstPrice", price);
			this.store.put("firstPriceDate", new Date().getTime());
		}
		return true;
	}

	// Retrieve stored price data.
	getFirstPriceOfTheDay() {
		return this.store.get("firstPrice");
	}

	async run() {
		// Compare the current price to the first price
		return this.getPrice().then(new_price => {
			this.storeFirstPriceOfTheDayIfNeeded(new_price);
			const first_price = this.getFirstPriceOfTheDay();
			logger.info(`The new price is ${new_price}`);
			logger.info(`The first price is ${first_price}`);
			logger.info(`The maxAffordablePrice is ${this.config.maxAffordablePrice}`);
			let color;
			let message;
			// If there is no flight listed.
			if (new_price == null) {
				color = '#DF0101'; // red
				message = `This flight is not listed. Please modify your request.`;
			}
			else if (new_price <= this.config.maxAffordablePrice) {
				if (first_price == null) {
					color = '#FFFF00'; // yellow
					message = `Departure date: ${this.config.departureDate}.
					The current price of this flight is	${new_price} ${this.config.currency}.`;
				} else if (new_price <= first_price) {
					color = '#088A08'; // green
					message = `Departure date: ${this.config.departureDate}.
					The current price of this flight is ${new_price} ${this.config.currency}.`;
				} else {
					color = '#FFFF00'; // yellow
					message = `Departure date: ${this.config.departureDate}.
					The current price of this flight is ${new_price} ${this.config.currency}.`;
				}
			} else {
				if (first_price == null) {
					color = '#FF8000'; // orange
					message = `Departure date: ${this.config.departureDate}.
					The current price of this flight is ${new_price} ${this.config.currency}.`;
				} else if (new_price <= first_price) {
					color = '#FF8000'; // orange
					message = `Departure date: ${this.config.departureDate}. 
					The current price of this flight is ${new_price} ${this.config.currency}.`;
				} else {
					color = '#DF0101'; // red
					message = `Departure date: ${this.config.departureDate}.
					The current price of this flight is ${new_price} ${this.config.currency}.`;
				}
			}
			const linkParams = {
				url: `https://www.skyscanner.com/transport/vols/${this.config.departurePlace}/${this.config.destinationPlace}/${this.config.departureDate}`,
				label: 'Open in Skyscanner!'
			}
			const a = new q.Signal({
				points: [
					[new q.Point(color)]
				],
				name: `Flight ${this.config.departurePlace} -> ${this.config.destinationPlace}`,
				message: message,
				link: linkParams,
				errors: 'Error signal'
			});
			return a;
		}).catch(err => {
			if (err === 'Quota exceeded') {
				return new q.Signal({
					points: [
						[new q.Point('#DF0101')]
					],
					name: `Flight ${this.config.departurePlace} -> ${this.config.destinationPlace}`,
					message: 'Wait, we are looking for the prices...'
				});
			} else {
				return q.Signal.error(err);
			}

		});
	}

	isDateFormatValid(date) {
		// var regEx = /^\d{4}-\d{2}-\d{2}$/;	
		var regEx = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
		if (!date || date.match(regEx)) {
			return true; //Valid format
		} else {
			return false;  // Invalid format
		}
	}

	ismaxAffordablePriceFormatValid(price) {
		var regEx = /^[0-9]*$/;
		if (!price || price.match(regEx)) {
			return true; // Valid format
		} else {
			return false; // Invalid format
		}
	}

	async applyConfig() {
		if (!this.isDateFormatValid(this.config.departureDate)) {
			throw new Error('Depart date format invalid');
		} else if (!this.ismaxAffordablePriceFormatValid(this.config.maxAffordablePrice)) {
			throw new Error('maxAffordablePrice format invalid');
		}
		// The value in the store is reset when the user changes the configuration
		// of the applet, for example if he wants to change the departurePlace or whatever
		this.store.clear();
	}
}

module.exports = {
	FlightPriceWatcher: FlightPriceWatcher
}

new FlightPriceWatcher();