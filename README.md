# Nawwa Scalper Terminal

This CLI is a textual UI (TUI) terminal tool, it's goal is to automate certain action when you are trading / scalping, aka : place scale orders, auto-limit order, cancel orders, shortcuts..

This repository is a re-write of my first project [nawwa-scalper-tool](https://github.com/CryptoNawwa/nawwa_scalper_tool) which was done in Python (meh).
This version is fully written in Typescript 🚀

Also **NawwaScalperTerminal** now supports the **Bybit** & **Binance** exchanges !

> Note: The code was made so it's easy for a developer to implement any new exchange

#### Socials & Tip

Twitter : [@crypto_nawwa](https://twitter.com/crypto_nawwa)
Discord : **Nawwa#8129**
**_TIP JAR_**
erc-20 : `0xc44823Cda133B49cb7F91B5cFa517FA76d3Ae561`

# Demo

Auto take profit system on Quantower

![demo2](./img/ATP-command.gif)

cancel and create orders

![demo1](./img/gif_scale_cancel.gif)

launch auto take profit

![demo2](./img/gif_ticker_atp.gif)

# Features

- **_Bybit_** & **_Binance_** support
- Easy switch between exchanges
- Display current active ticker & active exchange in terminal UI
- Place scale reduce-only limit orders based on .% range away from entry
- Place 1 (one) reduce only limit order, based on .% away from entry
- **_Automatic take-profit_** system, on activation, the terminal will automatically place pre-configured scale or single order(s) whenever it detect a new position
- Cancellation of recent orders
- Create/Update shortcuts (shortcuts = alias for your commands)
- Terminal history (up and down arrows)
- Terminal autocomplete (tab)

### What I'm working on

- Automatic detection of tab switching or symbol switching from [Quantower](https://www.quantower.com/), [Tealstreet.io](https://trade.tealstreet.io/trade) & [InsilicoTerminal](https://insilicoterminal.com/#/)
- Place order at best bid/ask

> Feel free to suggest anything

# How to install

## Standalone app ready to run

You can download the `nawwa-scalper-terminal` app directly from here :

[Windows](./bin/nawwa-scalper-terminal-win.exe)
[MacOs](./bin/nawwa-scalper-terminal-macos)
[Linux](./bin/nawwa-scalper-terminal-linux) - (not tested yet)

If you are familiar with our beloved friend [Ichibot](https://gitlab.com/Ichimikichiki/ichibot-client-app), this is just like it, I will shamelessly copy-past some of his instructions :

**Extra Steps on MacOS or Linux**
Open a terminal and and navigate to wherever you put the `nawwa-scalper-terminal`

- `cd Downloads` (Or whatever directory `nawwa-scalper-terminal` is in)
- `chmod +x nawwa-scalper-terminal-macos`
  or for linux :
- `chmod +x nawwa-scalper-terminal-linux`

Then:

- just `double click on the app` to launch
- alternatively, type in your terminal: `./nawwa-scalper-terminal-macos`
  or for linux:
- type: `./nawwa-scalper-terminal-linux`

**Extra Steps on Windows**

**Strongly recommended** : Install the terminal called [ Windows Terminal ](https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701), the `nawwa-scalper-terminal` has some cool emojies and colors, they might not work in basic terminal.

To launch the `nawwa-scalper-terminal`:

- Just double click the app
- However, if it opens and closes real quick :
  - then open a cmd (terminal) window, and drag `nawwa-scalper-terminal-win.exe` and drop it into the black of the cmd (terminal) window
  - can also open cmd window and type: `cd Desktop` (or wherever you put it) and then type: `nawwa-scalper-terminal-win.exe` to run it.

## Build from source yourself

I will detail this more in the futre, for the moment you can do:

- Download the [Source code](https://github.com/CryptoNawwa/nawwa_scalper_terminal/archive/refs/heads/main.zip)
- Unzip it somewhere you can find easily
- Install `NodeJS` -> https://nodejs.org/en/download/
- Install `yarn` -> https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable
- Open any terminal, navigate into the project directory
- `cd <wherever_you_unziped_the_source_code>/nawwa_scalper_terminal-main`
- Then type
  - `yarn install` (it will install dependencies)
  - `yarn start` (it will start the app)

That's it !
To run the project in the future :

- `cd nawwa-scalper-terminal`
- `yarn start`

# Shortcuts / Aliases

To add / remove shortcuts, open the `shortcuts.json` file located next to the app.

Shortcut file syntax is :

```json
{
  "name_of_shortcut": "command",

  "name_of_shortcut_2": "command"
}
```

Example of a shortcut file :

```json

{

"s1": "scale 5 0.01 0.03",

"s2": "scale 5 0.02 0.04",



"tp1": "tp 0.1",

"tp4": "tp 0.3",



"atp4": "atp ON tp4",
"atp4": "atp ON s1",


"t": "ticker",
"p": "positon",
"bb": "connect bybit",
"bn": "connect binance"

"sol": "ticker sol",
"eth": "ticker eth",
"btc": "ticker btc"

}

```

Pretty simple:

- when you type `bb` in the terminal, it will execute `connect binance`
- when you type `t btc` in the terminal, it will replace `t` by `ticker` and execute `ticker btc`
- when you type `atp4` in the terminal, it will execute `atp ON tp4`

You can add / update aliases and shortcut directly from the terminal, see the `shortcut`command info below, or type `help shortcut` in the terminal

_Note : Shortcut are used by the `atp` command, see later._

# Availables commands

You can type `help` in the app and it will display the list of all available commands and how to use it.

If you want to see more detail about a certain command you can type `help <command_name>` and it will display a detailed description with examples :

```
> help scale
Usage:
- scale <nb_of_order> <from_%> <to_%>

Examples:
- 'scale 10 0.1 0.2' -> Will create 10 reduce-only orders on the active ticker, from 0.1% to 0.2% away from the entry price
- 'scale 2 0.5 0.8' -> Will create 2 reduce-only orders on the active ticker, from 0.5% to 0.8% away from the entry price
```

---

### **ticker [ticker_name]**

This command switch the active ticker to a new one

```sh

> ticker ethusdt

or

> ticker eth

```

In this example, the command set the active ticker to `ETHUSDT`

The current active ticker is displayed on your terminal

_Note : You will need to have a ticker selected to execute certain command_

---

### **scale [nb_of_order] [from_%] [to_%]**

This command create `[nb_of_order]` reduce-only limit order(s) on the active ticker, from `[from_%]` above entry price to `[to*%]` above entry price (or below if short)

```sh

> scale 10 0.1 to 0.2

```

In this example, it will create 10 orders from 0.1% to 0.2%

_Note : For this command to work you need to have an open position on the active ticker_

---

### **tp [away_from_entry_%]**

This command create 1 (one) reduce-only limit order on the active ticker, from `[away_from_entry_%]` above entry_price (or below if short)

```sh
> tp 0.4
```

In this example, it will create 1 order from 0.4% away from entry price

_Note : For this command to work you need to have an open position on the active ticker_

---

### **cancel [type_of_cancel]**

This command cancel the recent limit orders for the current ticker

```sh
> cancel
```

---

### **shortcut [action] [shortcut_name]=[shortcut_value]**

This command will do the `[action]` with `[shortcut_name]` and `[shortcut_value]` as parameter

This command is usefull to add / modify shortcuts
Available actions:

- ADD

```sh
> shortcut ADD tp10=scale 4 0.5 0.9
```

In this example, a shortcut named `tp10` will be added to the `shortcuts.json` file, with the shortcut value being `scale 4 0.5 0.9`

Assuming the file was empty, after this command it will look like this :

```json
{
  "tp10": "scale 4 0.5 0.9"
}
```

Now, when you type `tp10` in the terminal, it will execute `scale 4 0.5 0.9`

---

### **atp [atp_action] [shortcut_name]**

This command will perform the `[atp_action]` with `[shortcut_name]` as parameter

Actions availabe :

- ON

- OFF

- STATUS

**_atp_** command (for automatic take profit) will automatically set reduce-only limit orders based on the shortcut config you gave him.

:warning: Once it's `ON` , the `atp` system works for **all the positions you enter**, on every pair.  
It means that if you take a trade on another pair, it will place the limit order(s), it's not only related to the current active ticker (might change that later if it's a problem / or a request)

### **ON** example

Considering we have the following shortcut file :

```json
{
	"tp1" : scale 10 0.1 to 0.2 `
}
```

```sh
> atp ON tp1
```

This will activate the autotp system with the shortcut `tp1` as limit order config

It means, if we enter a position on any coin, the bot will execute `scale 10 0.1 to 0.2 `

- It will automatically set 10 limit orders from 0.1 to 0.2 each time you enter a position

_Note : Obviously, only use `scale` or `tp` shortcuts_ for atp command

This will update the shortcut used by the `autotp` cmd to the shortcut called `tp4`

_Note : shortcuts needs to be defined in the file located in shortcuts/shortcuts.json_

### **OFF** example

```sh
> atp OFF
```

This will disable the `atp` system

### **STATUS** example

```sh
> atp STATUS
```

This will print the current status (**_ON_** / **_OFF_**)

# Support

If you need any help, follow & dm me on twitter [crypto_nawwa](https://twitter.com/crypto_nawwa) or add me on Discord **Nawwa#8129**

# Disclaimer

Downloading and using this bot is at your own risk, you take full responsibility and if you lose money it's your own fault. I recommend using it on a test account first.
