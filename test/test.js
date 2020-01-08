var assert = require('assert');
const t = require('../index');
const {
    FlightPriceWatcher
} = require('../index');

/**
 * Build the app with the getPrice function that returnns a fake response
 */
function buildAppWithFakeResponse() {
    let app = new t.FlightPriceWatcher();
    app.getPrice = async function () {
        return 99; // new_price
    };
    app.config = {
        originPlace: 'JFK',
        destinationPlace: 'AUS',
        departDate: '2020-02-02',
        returnDate: '2020-02-10',
        currency: 'USD',
    }
    return app;
  };

describe('FlightPriceWatcher', () => {
    describe('#constructor()', function () {
        it('should construct and check the date', function () {
            let app = new FlightPriceWatcher();
            assert.ok(app);
            // Check if the date format is correct
            assert.ok(app.isDateFormatValid('2020-02-02'));
            assert.equal(app.isDateFormatValid('2020-0202-02'), false);
        });
    });
    describe('Check the case of none in the storage', () => {
        // Check if the keyboard key is the right color when none is stored
        // Means getLastPrice returns null
        it('Can get price when none is stored when new_price<=threshold', function () {
            const app = buildAppWithFakeResponse();
            app.config.threshold = 100;
            assert.ok(app.setLastPrice(null));
            assert.equal(app.getLastPrice(), null);
            return app.run().then((signal) => {
                assert.ok(signal); 
                // Has to be yellow
                assert.equal(signal.points[0][0].color, '#FFFF00');
            }).catch((error) => {
                assert.fail(error)
            });
        });
        it('Can get price when none is stored when new_price>threshold', function () {
            const app = buildAppWithFakeResponse();
            app.config.threshold = 98;
            assert.ok(app.setLastPrice(null));
            assert.equal(app.getLastPrice(), null);
            return app.run().then((signal) => {
                assert.ok(signal); 
                // Has to be orange
                assert.equal(signal.points[0][0].color, '#FF8000');
            }).catch((error) => {
                assert.fail(error)
            });
        });
    });
    describe('Check the color of the key when new_price <= old_price', () => {
        // Check if the keyboard key is the right color when the new price > the old price
        it('Color of the key when new_price<=threshold', async function () {
            // This price has to be adapted
            let app = buildAppWithFakeResponse();
            app.config.threshold = 100;
            const price = 500; // old_price
            console.log('<<<<<set old price>>>>', price);
            assert.ok(app.setLastPrice(price));
            assert.equal(app.getLastPrice(), price);
            return app.run().then((signal) => {
                assert.ok(signal); 
                // Has to be green
                assert.equal(signal.points[0][0].color, '#088A08');
            }).catch((error) => {
                assert.fail(error)
            });
        });
        it('Color of the key when new_price>threshold', async function () {
            // This price has to be adapted
            let app = buildAppWithFakeResponse();
            app.config.threshold = 98;
            const price = 500; // old_price
            console.log('<<<<<set old price>>>>', price);
            assert.ok(app.setLastPrice(price));
            assert.equal(app.getLastPrice(), price);
            return app.run().then((signal) => {
                assert.ok(signal); 
                // Has to be orange
                assert.equal(signal.points[0][0].color, '#FF8000');
            }).catch((error) => {
                assert.fail(error)
            });
        });
    });
    describe('Check the color of the key when new_price > old_price', () => {
        // Check if the keyboard key is the right color when the new price <= the old price
        it('Color of the key when new_price<=threshold', async function () {
            // This price has to be adapted
            let app = buildAppWithFakeResponse();
            app.config.threshold = 100;
            const price = 20; // old_price
            console.log('<<<<<set old price>>>>', price);
            assert.ok(app.setLastPrice(price));
            assert.equal(app.getLastPrice(), price);
            return app.run().then((signal) => {
                assert.ok(signal); 
                // Has to be yellow
                assert.equal(signal.points[0][0].color, '#FFFF00');
            }).catch((error) => {
                assert.fail(error)
            });
        });
        it('Color of the key when new_price>threshold', async function () {
            // This price has to be adapted
            let app = buildAppWithFakeResponse();
            app.config.threshold = 98;
            const price = 20; // old_price
            console.log('<<<<<set old price>>>>', price);
            assert.ok(app.setLastPrice(price));
            assert.equal(app.getLastPrice(), price);
            return app.run().then((signal) => {
                assert.ok(signal); 
                // Has to be red
                assert.equal(signal.points[0][0].color, '#DF0101');
            }).catch((error) => {
                assert.fail(error)
            });
        });
    });
});
