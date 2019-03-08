[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![code size](https://img.shields.io/github/repo-size/elviswolcott/bandersnatch-PAC.svg?style=flat-square)](https://github.com/elviswolcott/bandersnatch-PAC)
[![GitHub issues](https://img.shields.io/github/issues/elviswolcott/bandersnatch-PAC.svg?style=flat-square)](https://github.com/elviswolcott/bandersnatch-PAC/issues)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/elviswolcott/bandersnatch-PAC.svg?style=flat-square)](https://github.com/elviswolcott/bandersnatch-PAC/blob/master/package.json)
[![Website](https://img.shields.io/website-up-down-green-red/https/pac.elviswolcott.com.svg?style=flat-square)](https://pac.elviswolcott.com)
[![GitHub last commit](https://img.shields.io/github/last-commit/elviswolcott/bandersnatch-PAC.svg?style=flat-square)](https://github.com/elviswolcott/bandersnatch-PAC/commits/master)
[![Known Vulnerabilities](https://snyk.io/test/github/elviswolcott/bandersnatch-PAC/badge.svg?style=flat-square)](https://snyk.io/test/github/elviswolcott/bandersnatch-PAC/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/1e1b6747-be84-4f08-9aba-c75f34fbb0b4/deploy-status)](https://app.netlify.com/sites/pensive-borg-90db04/deploys)

# :red_circle: Live Demo #

## :computer: Extension ##

You can grab this extension from the Chrome Web Store [here](https://chrome.google.com/webstore/detail/bandersnatch-pac/lhcoekiedpkknoomgpjinffiplhinifb). Install the extension start watching [Bandersnatch](https://www.netflix.com/watch/80988062). The extension should turn red. When you click it, a QR code and channel code will pop up. You can enter these from the web app.

## :iphone: Web App ##

If you have a QR Code scanner you can just scan the QR Code!

Otherwise, go to [https://pac.elviswolcott.com](https://pac.elviswolcott.com) to access the remote. If you allow camera access you can scan the QR Code from the site, or you can enter the code manually.

Once the code is entered, your phone will be synced to the extension. You should see the options on screen mirrored to your phone at the next decision.

# :blue_book: Table of Contents #

1. [:red_circle: Live Demo](#red_circle-live-demo)
    - [:computer: Extension](#computer-extension)
    - [:iphone: Web App](#iphone-web-app)
2. [:grey_question: Why would I need this?](#grey_question-why-would-i-need-this)
3. [:fast_forward: Quickstart](#fast_forward-quickstart)
    1. [:floppy_disk: Download the Project](#floppy_disk-download-the-project)
    2. [:key: Get your **FREE** PubNub keys](#key-get-your-free-pubnub-keys)
    3. [:hammer: Build the Web App](#hammer-build-the-web-app)
    4. [:hammer: Build the Chrome Extension](#hammer-build-the-chrome-extension)
    5. [:earth_americas: Deploying the Site](#earth_americas-deploying-the-site)
4. [:gear: Development](#gear-development)
5. [:question: FAQ](#question-faq)
    - [The remote gets the options before they show up on screen. What is this magic?](#the-remote-gets-the-options-before-they-show-up-on-screen-what-is-this-magic)
    - [What happens if I don't vote?](#what-happens-if-i-dont-vote)
    - [What happens when there's a tie?](#what-happens-when-theres-a-tie)
    - [Can you add...](#can-you-add)
    - [My question isn't here!](#my-question-isnt-here)
    - [It's broken.](#its-broken)

# :grey_question: Why would I need this? #

While watching Bandersnatch with a group of friends I encountered an unexpected issue. Coming to a consensus in the 10 second decision window can prove to be a challenge. This project addresses this issue by providing a remote control designed specifically for Bandersnatch which supports voting between multiple users. It also can make for a fun thematic twist when playing with others - nobody is in control of what path they follow.

This was a perfect project to show off the capabilities PubNub. When you only have 10 seconds to make your decision, every millisecond counts. PubNub's ultra low latency ensures that every vote cast makes it to the extension in time to be counted. Combined with a little bit of magic, the extension can even get the pathways to the remote _before_ they are visible on your TV.

# :fast_forward: Quickstart #

## :floppy_disk: Download the Project ##

You can download the project in any of these ways:

1. Git Clone **(recommended)** - _requires [git](https://git-scm.com/)_ 
    - In your terminal, navigate to the directory where you want your project saved
    - `git clone https://github.com/elviswolcott/bandersnatch-PAC.git`
  
2. GitHub Desktop - _requires [GitHub Desktop](https://desktop.github.com/)_
    - [Click here](x-github-client://openRepo/https://github.com/elviswolcott/bandersnatch-PAC) to open in GitHub Desktop **or** click `Clone or Download` at the top of this page and select `Open in Desktop`

3. Download as ZIP
    - [Click here](https://github.com/elviswolcott/bandersnatch-PAC/archive/master.zip) to download a ZIP **or** click `Clone or Download` at the top of this page and select `Download ZIP`
    - Extract the ZIP in your desired directory

## :key: Get your **FREE** PubNub keys ##

- Sign up/Login to the [PubNub dashboard](https://dashboard.pubnub.com/signup)
- Click the big red button labeled `CREATE NEW APP +`
- Enter a name for your app (I went with Bandersnatch PAC for consistency) and click `CREATE`
- Select your new app and then select the `Demo Keyset`
- Create a file named `keys.json` in the project directory and paste in the JSON below (both the extension and the web app need this to connect to PubNub)
- Replace the `publishKey` and `subscribeKey` with your keys from the PubNub dashboard and save the changes

```json
{
  "publishKey" : "pub-c-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXX",
  "subscribeKey" : "pub-c-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXX"
}
```

## :hammer: Build the Web App ##

- Edit `deploy-details.json` to contain the path where you will deploy the project
- In your terminal, navigate to the project directory
- `npm run install:web` - Downloads the dependencies _note: you only need to run this the first time you build the web app_
- `npm run build:web` - Builds the web app to `/web/dist`

## :hammer: Build the Chrome Extension ##

- In your terminal, navigate to the project directory
- `npm run install:ext` - Downloads the dependencies _note: you only need to run this the first time you build the extension_
- `npm run build:ext` - Builds the Chrome extension to `/ext/dist`
- In Chrome, navigate to [chrome://extensions](chrome://extensions)
- Enable `Developer mode` in the top right corner
- Click `Load unpacked...` and choose `/ext/dist`

## :earth_americas: Deploying the Site ##

How you deploy the site is up to you. As long as you make the `/web/dist` directory accessible you should be good to go.

I find that [Netlify](https://netlify.com/) is the easiest option. If you don't have a Netlify account, the easiest option is [Netlify Drop](https://app.netlify.com/drop). You can just drag and drop the `/ext/dist` directory into your browser and Netlify will deploy it for you. You can set up a custom domain, tweak your settings, and create an account to keep your site online permanently. 

If you want make your own changes, the best option is to use Netlify to deploy from git. They'll automatically build the site on their servers and publish the result every time you commit. Getting Netlify setup to deploy from git only takes a few clicks. 

- Sign in to [Netlify](https://app.netlify.com/)
- Click `New site from Git`
- Select your git provider
- Link your account
- Find and select your repository
- For `Build command` use `npm run netlify`
- For `Publish directory` use `web/dist`
- Open the `Advanced options`
- Add a `New variable` and enter `publishKey` for the key and your PubNub key for the value
- Add a `New variable` and enter `publishKey` for the key and your PubNub key for the value
- `Deploy site`

# :gear: Development #

These commands help when you are actively making changes by keeping code readable and serving the web app to a local webserver.

- `npm run serve:web` - Use Hot Module Reloading to reduce build times and serve files on a local webserver
- `npm run lint:web` - Lint and format code ESLint + Prettier
- `npm run lint:ext` - Format code with Prettier

# :question: FAQ #

## The remote gets the options before they show up on screen. What is this magic? ##

Because the options have animations, they are detectable shortly before they are displayed. The Chrome Extension uses [Mutation Observers](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to watch for changes to the DOM. This allows it to pull out the options as soon as they are added to the page. Combined with the speed of PubNub, messages can arrive in as little as 30ms-40ms with a global guarantee of 250ms. In comparison, visual reaction speed is around 150ms-200ms and a blink takes 100ms-400ms. With PubNub, messages literally arrive in the blink of an eye.

Sources:
1. [PubNub Latency](https://www.pubnub.com/developers/tech/network-infrastructure/)
2. [Reaction Speed](http://www.jneurosci.org/content/jneuro/26/15/3981.full.pdf)
3. [Blink Speed](https://bionumbers.hms.harvard.edu/bionumber.aspx?id=100706&ver=0)

## What happens if I don't vote? ##

The extension will do nothing, Netflix will go with the default option.

## What happens when there's a tie? ##

This behavior is somewhat undefined. The vote tallying uses `Object.enumerate`, so the order votes are processed depends on the order of the object keys. However, this does not necessarily mean the first vote will win. According to the spec, JSON key/value pairs are unsorted. Therefore, the order they will be processed is unknown. This adds some level of randomness, which seems like a acceptable solution for ties.

Sources:
1. [JSON Spec](https://json.org/)

## Can you add... ##

Maybe, [create an issue](https://github.com/elviswolcott/bandersnatch-PAC/issues/new) with the `enhancement` tag and I'll see if it's something I can add.

## My question isn't here! ##

[Create an issue](https://github.com/elviswolcott/bandersnatch-PAC/issues/new) with the `question` tag and I'll add it to the FAQ.

## It's broken. ##

[Create an issue](https://github.com/elviswolcott/bandersnatch-PAC/issues/new) with the `bug` tag and I'll work on a fix.
