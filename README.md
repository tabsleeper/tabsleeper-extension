# Tab Sleeper

Simple tool to sleep and wake tab sessions in the browser.

This is aimed at helping the case where you have several distinct 'sessions'
that you browse in (e.g. "fixing my car", "webcomics") at different times, but
which don't warrant a separate Chrome user profile and don't need to be open
all of the time.

Note: These slept tabs **do not sync** between your machines.

# Upcoming features

- Re-ordering groups

## Maybe

- Synchronisation between machines

# Developing

You want to make a change? Cool! (and if you need any help at all getting set
up or have any questions, email me - my address is on my GitHub profile)

## Set up

[Get Node](https://nodejs.org/en/) - The current version is described in .circleci/config.yml

Fork and clone this repository

    $ git clone git@github.com:<yourusername>/tab-sleeper.git
    $ cd tab-sleeper.git

Install the dependencies

    $ npm install

Do a build to make sure everything is running smooth

    $ npm run build

If there are no problems, great!

## Loading into Chrome

The manifest is constructed as part of the build process, so you'll need to
link it to the repository root in order to load the extension:

    $ ln -s ./build/platform/chrome/manifest.json ./manifest.json

Then load the extension as normal.

See Chrome developer docs section on [loading the
Extension](https://developer.chrome.com/extensions/getstarted#unpacked)

## Loading into Firefox

The manifest is constructed as part of the build process, so you'll need to
link it to the repository root in order to load the extension:

    $ ln -s ./build/platform/firefox/manifest.json ./manifest.json

Then load the extension as normal.

Note: if you have recently built the extension in release/production mode,
rebuild it in development mode (`npm run build`) otherwise you will load a
temporary extension with the same ID as the production one, and risk data loss.

See Firefox developer docs section on [loading the
Extension](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)

## Submitting your changes

[Send a pull request through
GitHub](https://help.github.com/articles/using-pull-requests/) and it will be
reviewed, and any further changes that might need to be made can be discussed
in the issue thread.
