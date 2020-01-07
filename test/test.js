var assert = require('assert');
const t = require('../index');
const {
    FlightPriceWatcher
} = require('../index');

// /!\ Go to the botton and add the API KEY before testing /!\

/**
 * Build the app with the get Assignments method that returnns a fake response
 */
function buildAppWithFakeResponse() {
    let app = new t.FlightPriceWatcher(getConfig());
    app.getPrice = async function () {
      return new_price = 99;
    };
    return app;
  };

describe('FlightPriceWatcher', () => {
    describe('#constructor()', function () {
        it('should construct and check the date', function () {
            let app = buildAppWithFakeResponse();
            assert.ok(app);
            // Check if the date format is correct
            assert.ok(app.checkFormatDate());
        });
    });
    describe('#run()', () => {
        // Check if the keyboard key is the right color when none is stored
        // Means getLastPrice returns null
        it('Can get price when none is stored', function () {
            const app = buildAppWithFakeResponse();
            assert.ok(app.setLastPrice(null));
            assert.equal(app.getLastPrice(), null);
          })
        it('check the color of the key when none is stored', async function () {
            const app = buildAppWithFakeResponse();
            return app.run().then((signal) => {
                assert.ok(signal); 
                // Has to be green
                assert.equal(signal.points[0][0].color, '#088A08');
            }).catch((error) => {
                assert.fail(error)
            });
        });
    });
    describe('FlightPriceWatcher', () => {
        // Check if the function getPrice give the correct current price
        it('Can get the current price', async function () {
            const app = buildAppWithFakeResponse();
            return app.getPrice().then((new_price) => {
                console.log('<<<<<get current price>>>>', new_price);
                assert.notEqual(new_price, null);
            }).catch((error) => {
                assert.fail(error);
            })
        })
    });
    describe('#run()', () => {
        // Check if the keyboard key is the right color when the new price > the old price
        it('Can store the last price and get it from storage', function () {
            // This price has to be adapted
            let app = buildAppWithFakeResponse();
            const price = 500;
            console.log('<<<<<set old price>>>>', price);
            assert.ok(app.setLastPrice(price));
            assert.equal(app.getLastPrice(), price);
        })
        it('check the color of the key when new_price <= old_price', async function () {
            const app = buildAppWithFakeResponse();
            return app.run().then((signal) => {
                assert.ok(signal); 
                // Has to be red
                assert.equal(signal.points[0][0].color, '#088A08');
            }).catch((error) => {
                assert.fail(error)
            });
        });
    });
    describe('#run()', () => {
        // Check if the keyboard key is the right color when the new price <= the old price
        it('Can store the last price and get it from storage', function () {
            // This price has to be adapted
            let app = buildAppWithFakeResponse();
            const price = 20;
            console.log('<<<<<set old price>>>>', price);
            assert.ok(app.setLastPrice(price));
            assert.equal(app.getLastPrice(), price);
        })
        it('check the color of the key when new_price > old_price', async function () {
            const app = buildAppWithFakeResponse();
            return app.run().then((signal) => {
                assert.ok(signal); 
                // Has to be green
                assert.equal(signal.points[0][0].color, '#DF0101');
            }).catch((error) => {
                assert.fail(error)
            });
        });
    });
});

function getConfig() {
    const defaultConfig = {
        applet: {
            user: {
                originPlace: 'JFK',
                destinationPlace: 'AUS',
                departDate: '2020-02-02',
                returnDate: '2020-02-10',
                currency: 'USD'
            }            
        },
        geometry: {
            width: 1,
            height: 1,
        }
    };
    return defaultConfig;
}

// Build application
async function buildApp(config) {
    let app = new t.FlightPriceWatcher();
    await app.processConfig(config);
    return app;

}