# Advanced React Course
This is the repository for the project 'Sick Fits' created while following along with the Advanced React & GraphQL course by Wes Bos, below.

You can see the deploy live at {DEPLOYMENT URL}, login with _test@bridgerputnam.me:testpw_.

The web app is created with a Prisma server running atop PostgreSQL for storing data and to provide a GraphQL API, a Yoga server to process GraphQL queries and mutations, and a React app using next.js for serving up the web pages and the client-side app.

## Deployment

To deploy Sick Fits, first clone this repository. Sign up for Prisma and Heroku if you haven't already, and make sure you have the heroku CLI installed.

### Deploying the Prisma server
On your Prisma dashboard, create a new server. You'll have to make up a name for it, 'sick-fits-YOURNAME' should work. Choose Heroku for deploying your PostgreSQL database, along with Heroku for your Prisma server. Alternatively, you could create a PostgreSQL server on a hosting provider like DigitalOcean or AWS, and then deploy a Prisma server manually at the provider of your choice. Prisma will soon allow you to deploy to AWS, Google Cloud, and more.

Once you have the servers created, run `npm run deploy -- -n`. The `-- -n` tells npm to pass along the `-n` flag to the deploy script.

After the Prisma backend is deployed, open prisma.yml and uncomment the secret key-value pair and run `npm run deploy` again, without the `-n`.

### Deploying the Yoga server


### Deploying the React application



![Advanced React & GraphQL](https://advancedreact.com/images/ARG/arg-facebook-share.png)

# Advanced React & GraphQL

These are the starter files and stepped solutions for the [Advanced React & GraphQL](https://AdvancedReact.com) course by [Wes Bos](https://WesBos.com/).

## Getting Help

The best place to get help is in the #advanced-react slack room - there is a link in your course dashboard.

## FAQ

**Q:** Which Extensions for VS Code is Wes using?  
**A:** All my extensions are listed on [my dotfiles repo](https://github.com/wesbos/dotfiles), but specifically this course uses [ESLint](https://github.com/Microsoft/vscode-eslint) and [Prettier](https://github.com/prettier/prettier-vscode).
