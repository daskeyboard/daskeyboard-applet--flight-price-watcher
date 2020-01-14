# Q Applet: Flight Price Watcher

This applet displays the price trend of a selected flight.

[GitHub repository](https://github.com/daskeyboard/daskeyboard-applet--fly-me)

## Example

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

![Flight Price Watcher on a Das Keyboard Q](assets/image.png "Flight Price Watcher result")

## Changelog

[CHANGELOG.MD](CHANGELOG.md)

## Installation

Requires a Das Keyboard Q Series: www.daskeyboard.com

Installation, configuration and uninstallation of applets is done within
the Q Desktop application (<https://www.daskeyboard.com/q>)

## Running tests

Run

    npm test

## Contributions

Pull requests welcome.

## Copyright / License

Copyright 2014 - 2020 Das Keyboard / Metadot Corp.

Licensed under the GNU General Public License Version 2.0 (or later);
you may not use this work except in compliance with the License.
You may obtain a copy of the License in the LICENSE file, or at:

   <http://www.gnu.org/licenses/old-licenses/gpl-2.0.txt>

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
