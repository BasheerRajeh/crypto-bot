# Crypto Bot

Crypto Bot is a Telegram bot that provides live cryptocurrency price updates. You can use it to get the current price of any supported cryptocurrency.

## Usage

1. Start a conversation with the bot by clicking on the following link: [Crypto Bot](https://t.me/YourBotUsername).

2. Send the name of the cryptocurrency you're interested in getting the price for. For example: `bitcoin`, `ethereum`, `dogecoin`, etc.

3. The bot will reply with the current price of the cryptocurrency you requested.

4. If you want to get the price of another cryptocurrency, simply send the name of that cryptocurrency to the bot.

## Environment Variables

The following environment variables need to be set in order for the bot to work properly:

- `BOT_TOKEN`: Your Telegram bot token.
- `API_ENDPOINT`: The API endpoint to use for retrieving cryptocurrency prices.

Copy the `.env.example` file to `.env` and replace the values with your own.

## Running the Bot Locally

To run the bot locally, follow these steps:

1. Clone this repository:

`git clone https://github.com/your-username/crypto-bot.git`

2. Install the dependencies:

- `cd crypto-bot`
- `npm install`
