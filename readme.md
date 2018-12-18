# Advanced React Course
This is the repository for the project 'Sick Fits' created while following along with the Advanced React & GraphQL course by Wes Bos, below.

You can see the deploy live at {DEPLOYMENT URL}, login with _test@bridgerputnam.me:testpw_.

The web app is created with a Prisma server running atop PostgreSQL for storing data and to provide a GraphQL API, a Yoga server to process GraphQL queries and mutations, and a React app using next.js for serving up the web pages and the client-side app.

## Installation
To install and run this app, you need to sign up for Prisma.io, Stripe, and a mock mail server such as Mailtrap.io. Fill in the variables.env.sample file in the `sick-fits/backend` folder and save it as variables.env.

To start the Prisma server, run `npm run deploy` in the backend folder.

To start the Yoga backend, run `npm run dev` in the backend folder.

To start the React application, run `npm run dev` in the frontend folder.

Navigate to `https://localhost:7777/` and enjoy your new store frontend!

## Deployment

To deploy Sick Fits, first clone this repository. Sign up for Prisma and Heroku if you haven't already, and make sure you have the heroku CLI installed.

### Deploying the Prisma server
On your Prisma dashboard, create a new server. You'll have to make up a name for it, _sick-fits-YOURNAME_ should work. Choose Heroku for deploying your PostgreSQL database, along with Heroku for your Prisma server. Alternatively, you could create a PostgreSQL server on a hosting provider like DigitalOcean or AWS, and then deploy a Prisma server manually at the provider of your choice. Prisma will soon allow you to deploy to AWS, Google Cloud, and more.

Once you have the servers created, run `npm run deploy -- -n`. The `-- -n` tells npm to pass along the `-n` flag to the deploy script.

After the Prisma backend is deployed, open prisma.yml and uncomment the secret key-value pair and run `npm run deploy` again, without the `-n`.

### Deploying the Yoga server
The Yoga server is what handles all of the resolvers for the project's GraphQL mutations and queries. Basically a wrapper on top of the GraphQL that you can program additional business logic into. This is located in the `sick-fits/backend` folder.

Create a new Heroku app with the following command, replacing `sick-fits-yoga-prod` with a unique name.
`heroku apps:create sick-fits-yoga-prod`

Since this git project is for both the front end and the back end, we won't be using the default heroku git remote, instead we will set one for the front end and one for the back end using the respective heroku git repos.

Set up your backend git repo by copying the default heroku URL you received from the apps:create and use that as the URL for heroku-backend.
`git remote add heroku-backend https://git.heroku.com/sick-fits-yoga-prod.git`

Push the backend folder to heroku-backend.
`git subtree push --prefix sick-fits/backend heroku-backend master`

Heroku will recognize that a node project has been pushed to it and build and install our server! Unfortunately, since we're .gitignore'ing our .env file, you will have to input the environmental variables manually via the heroku website and restart the heroku dyno.


### Deploying the React application

Deploying the frontend follows the same steps as deploying the Yoga server.

Make sure you update the `config.js` in your frontend folder to have the prodEndpoint match your heroku Prisma endpoint.

Create a new heroku app, `heroku apps:create sick-fits-frontend-prod`.

Add the remote for heroku-frontend, `git remote add heroku-frontend https://git.heroku.com/sick-fits-frontend-prod.git`.

Push the frontend folder to heroku-frontend, `git subtree push --prefix sick-fits/frontend heroku-frontend master`.

You're done!

---


![Advanced React & GraphQL](https://advancedreact.com/images/ARG/arg-facebook-share.png)

# Advanced React & GraphQL

These are the starter files and stepped solutions for the [Advanced React & GraphQL](https://AdvancedReact.com) course by [Wes Bos](https://WesBos.com/).

## Getting Help

The best place to get help is in the #advanced-react slack room - there is a link in your course dashboard.

## FAQ

**Q:** Which Extensions for VS Code is Wes using?  
**A:** All my extensions are listed on [my dotfiles repo](https://github.com/wesbos/dotfiles), but specifically this course uses [ESLint](https://github.com/Microsoft/vscode-eslint) and [Prettier](https://github.com/prettier/prettier-vscode).
