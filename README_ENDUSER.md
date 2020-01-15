# Flight Price Watcher

This applet displays the price trend of a flight*.

This applet will change the color of the key on the keyboard according to the maximum price the user can afford and
the price trend:

- <span style="color:green">Green</span>: The price is decreasing and is under the maximum price the user can afford.
- <span style="color:yellow">Yellow</span>: The price is increasing and is under the maximum price the user can afford.
- <span style="color:orange">Orange</span>: The price is decreasing and is above the maximum price the user can afford.
- <span style="color:red">Red</span>: The price is increasing and is above the maximum price the user can afford.

## Account set up

An account at [Skyscanner Flight Search](https://rapidapi.com/skyscanner/api/skyscanner-flight-search) is required in
order to get an API key.

The user needs to make sure he uses the key labeled `X-RapidAPI-Key` and paste it into the Flight Price Watcher applet.

(*) Supports only direct flights.

![Flight Price Watcher on a Das Keyboard Q](assets/image.png "Flight Price Watcher config and result")

