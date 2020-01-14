# Flight Price Watcher

This applet will help the user find the best flight prices.
The user has to create an account on <https://rapidapi.com/skyscanner/api/skyscanner-flight-search> in order to get his
API key.
The user will have to get the required API key which name is "X-RapidAPI-Key" and paste it in the designated input.
Then the user will have to check the average price of his selected flight on the real skyscanner website cause he has
to set this value in a designated input. This average price is the threshold value he doesn't want to exceed and it will
help him find the best deal.
The selected keyboard key will be green or yellow if the price of the flight is under the selected average price and
orange or red if not.
Incase the price of the flight is under the selected average price: the key will be green if the price is decreasing (so
it is probably the best moment to buy it), otherwise it will be yellow. However, it is still correct cause the price is
staying under the selected average price.
Incase the price of the flight is above the selected average price: the key will be orange if the price is decreasing,
otherwise it will be red. When the keyboard key is red, you have to worry cause it means the price of your flight is
going up and will probably keep being expensive.

![Flight Price Watcher on a Das Keyboard Q](assets/image.png "Flight Price Watcher config and result")
