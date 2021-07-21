# IRONHACK PROJECT 3

## THE IDEA

The idea of the project is to create a single page application with React. The theme of this app is creating a platform for artists to create and show a standard portfolio, as well as all the necessary information and tools to be contacted with in order to get a job or projects to work in.

This platform will also have the option to join as a recruiter, with several options to look for specific perks and skills within all the registered artists.

Additionally there will be the option to add brands and companies to our DDBB, so recruiters can specify which one they do work for.

At last, as a bonus, the platform could let the users create anonymous reports/complaints about plagiarism from companies and brands, in order to make it visible and do something about this extended problem in the industry.

## THE ROLES

The app will have two main roles. These are:

### - Main

-   Users ( Normal & Premium )
-   Recruiters

## PAGES

-   [ ] Navbar:

    -   [ ] It would feature the brand icon, as well as some links for users and recruiters logged
    -   [ ] It would feature several links to useful resources for artists (footer only?)
        -   [ ] APIM
        -   [ ] Libros blancos (ilustración, animación y vfx, impresión 3D...)
    -   [x] For those guests not logged in, it will show the register and log options
    -   [ ] For users logged it would feature a profile drop-down menu with:

        -   [ ] My profile
        -   [ ] My portfolio
        -   [ ] Log out

    -   [ ] For logged recruiters it would feature a profile drop-down menu with:

        -   [ ] My profile
        -   [ ] My job offers
        -   [ ] Log out

    -   [ ] For logged users it would feature a navlink to published job offers

---

-   [ ] Home:

    -   [ ] It would show random and featured artwork from different artists. It is public and accesible for anyone
    -   [x] It would show artwork

---

-   [x] Log in

---

-   [x] Sign up

---

-   [ ] My profile: to see oneself user info, with the option to edit it

---

-   [ ] My portfolio: to see oneself uploaded artwork and data -

---

-   [ ] My job offers: to see oneself published job offers

---

-   [ ] Explore: to see artwork, with a search form to filter. This search will be very basic for users (text input filter for title, artist and tags), but will have additional filters for recruiters:

    -   [ ] Basic search for artist
    -   [ ] Basic search for title
    -   [ ] Basic search for tags

    -   [ ] Advanced search for country
    -   [ ] Advanced search for city
    -   [ ] Advanced search for experience
    -   [ ] Advanced search for rating/likes/favourites/saved

---

-   [ ] Job offers: an explorer of job offers, with a search form to filter. This search will be equal for all users:

    -   [ ] Search for tags
    -   [ ] Search for title keywords
    -   [ ] Search for description keywords

---

-   [ ] Contact page for recruiters who want to contact artist users

---

-   [ ] Footer
    -   [ ] It would feature several links to useful resouces for artists
        -   [ ] APIM
        -   [ ] Libros blancos (ilustración, animación y vfx, impresión 3D...)
    -   [ ] About
    -   [ ] Licenses ( ? )

---

-   [ ] About

---

## SERVER ROUTES

### Auth routes

-   POST(`/api/signup`)

-   POST(`/api/login`)

-   GET(`/api/logout`)

-   POST(`/api/isLoggedIn`)

### User routes

-   GET(`/api/users/getAll`) => obtendrá todos los usuarios (para ver los portfolios y/o filtrarlos)

-   GET(`/api/users/:user_id`) => obtendrá un usuario por id (para ver sus detalles y portfolio completo)

-   PUT(`/api/users/:user_id/createPortfolio`) => añadirá a un usuario por id un portfolio nuevo

-   PUT(`/api/users/:user_id/editUser`) => actualizará los datos del usuario, ya sean sus datos personales, su portfolio, o sus ofertas publicadas

-   GET(`/api/users/:user_id/getJobOffers`) => obtendrá todas las ofertas de trabajo del usuario

-   GET(`/api/users/:user_id/getJobOffers/:job_id`) => obtendrá la oferta de trabajo concreta del usuario

-   POST(`/api/users/:user_id/createJobOffer`) => añadirá una nueva oferta de trabajo tanto a su collection como al usuario // DUDA

-   PUT(`/api/users/:user_id/editJobOffer/:job_id`) => actualizará los datos de la oferta de trabajo

### Job offers routes

-   GET(`/api/jobOffers/getJobOffers`) => obtendrá todas las ofertas de trabajo creadas

-   GET(`/api/jobOffers/getOneJobOffer/:job_id`) => obtendrá una oferta de trabajo creada

-   PUT(`/api/jobOffers/getOneJobOffer/:job_id/apply`) => añadirá al usuario a la lista de applicants

-   PUT(`/api/jobOffers/getOneJobOffer/:job_id/quit`) => quitará al usuario de la lista de applicants

### Portfolio routes

-   GET(`/api/portfolio/getAllImages`) => obtendrá todas las imágenes de portfolios

-   GET(`/api/portfolio/getOneImage/:img_id`) => obtendrá la imágen deseada

-   PUT(`/api/portfolio/:img_id/like`) => añadirá un like al contador

-   PUT(`/api/portfolio/:img_id/no-like`) => quitará el like del contador

-   GET(`/api/portfolio/:img_id/artist/:user_id`) => obtendrá SOLO el portfolio de le artista a partir del user_id almacenado para img_id // DUDA

## MODELS

-   User:

    -   Username: string
    -   Password: string
    -   Role: enum, [CREATOR, RECRUITER]
    -   Job offers: [ObjectId]
    -   Portfolio:
        -   Name: string
        -   Last name: string
        -   Country: string
        -   City: string
        -   About: string
        -   Tags: [string]
        -   Gallery: [ObjectId] => Lista de imágenes 'PortfolioImage' // DUDA
        -   Brands: [string] = Lista de marcas/empresas/proyectos para los que ha trabajado

-   PortfolioImage:

    -   Artist: ObjectId => Apuntará al id del usuario
    -   Img_url: string
    -   Tags: [string]
    -   Likes: number
    -   Liked: [ObjectId] => Apuntará al id de los usuarios que han dejado like

-   Job offer:

    -   Recruiter: ObjectId => Apuntará al id del usuario creador de la oferta
    -   Brand: string
    -   Title: string
    -   Description: string
    -   Tags: [string]
    -   Applicants: [ObjectId]

## COMPONENTS RAW

-   [x] App

    -   [ ] Navbar
        -   [x] Brand / Title logo
        -   [x] Navlink to SignupForm
            -   [x] SignupForm
        -   [x] Navlink to LoginForm
            -   [x] LoginForm
        -   [x] Navlink to logout
        -   [ ] Navlink to ExplorePage
        -   [ ] Navlink to JobOffersPage
        -   [ ] Dropdown menu:
            -   [x] Header My profile label
            -   [ ] Header profile img
            -   [ ] Navlink to Profile
            -   [ ] Navlink to Portfolio
            -   [ ] Navlink to JobOffers
            -   [ ] Log out navlink

    ***

    -   [x] Home
        -   [x] PortfolioImageList: a number of portfolio images
            -   [x] PortfolioImageItem
            -   [x] Link to PortfolioImageDetails
                -   [x] PortfolioImageDetails
                    -   [x] Like/dislike button depending on loggedUser (true | false - liked | disliked)

    ***

    -   [ ] Profile:

        -   [ ] PersonalInfo
        -   [ ] Link to EditProfileForm
        -   [ ] CreatorProfile:
            -   [ ] MyPortfolio: all portfolio data
            -   [ ] Link to MyJobOffers: list of:
                -   [ ] JobOffer
                -   [ ] Link to JobOfferDetails
                    -   [ ] JobOfferDetails
                        -   ([ ] ApplyButton) as the component, it will have it, but will no show since the user has already applied
                        -   [ ] QuitButton
            -   [ ] Link to EditPortfolioForm
            -   [ ] EditProfileForm
            -   [ ] EditPortfolioForm
        -   [ ] RecruiterProfile:
            -   [ ] MyJobOffers: list of:
                -   [ ] JobOffer
                -   [ ] Link to JobOfferDetails
                    -   [ ] JobOfferDetails
                    -   [ ] Link to EditJobOfferForm
                -   [ ] EditJobOfferForm
            -   [ ] Link to NewJobOfferForm
            -   [ ] NewJobOfferForm

    ***

    -   [ ] ExplorePage
        -   [ ] SearchBox
        -   [ ] PortfolioImageList:
            -   [ ] PortfolioImageItem
            -   [x] Link to PortfolioImageDetails
                -   [x] PortfolioImageDetails
                    -   [x] Like/dislike button depending on loggedUser (true | false - liked | disliked)
                -   [ ] Link to EditPortfolioForm => if artist equals the user seeing it/session user
                -   [ ] Link to ContactForm => if recruiter user

    ***

    -   [ ] JobOffersPage
        -   [ ] SearchBox
        -   [ ] JobOfferList:
            -   [ ] JobOffer
            -   [ ] Link to JobOfferDetails
                -   [ ] JobOfferDetails
                -   [ ] Link to EditJobOfferForm => if recruiter equals the user seeing it/session user
                -   [ ] ApplyButton
                -   [ ] QuitButton

    ***

    -   [ ] Footer

## COMPONENTS HIERARCHY

-   App
    -   Navbar
        -   Logo => Image url
        -   Navlink to SignupForm => '/signup'
            -   SignupForm
        -   Navlink to LoginForm => '/login'
            -   LoginForm
        -   Navlink to ExplorePage => '/explore
        -   Navlink to JobOffersPage => '/job-offers
        -   Dropdown menu:
            -   Navlink to Profile => '/user/profile
            -   Navlink to Portfolio => '/user/portfolio
            -   Navlink to JobOffers => '/user/job-offers
            -   Log out navlink => '/logout'
    -   Home => state: {listOfImages} // filterList()
        -   SearchBox => this.filterList
        -   PortfolioImageList => this.state.listOfImages={listOfImages}
            -   PortfolioImage
            -   Link to Portfolio => '/portfolio/:artist_id' // {...props}
    -   Profile => state: {username, password, portfolio, jobOffers}
        -   PersonalInfo
        -   Link to EditProfileForm
        -   CreatorProfile:
            -   MyPortfolio: all portfolio data
            -   Link to MyJobOffers: list of:
                -   JobOffer
                -   Link to JobOfferDetails
                    -   JobOfferDetails
                        -   (ApplyButton) as the component, it will have it, but will no show since the user has already applied
                        -   QuitButton
            -   Link to EditPortfolioForm
            -   EditProfileForm
            -   EditPortfolioForm
        -   RecruiterProfile:
            -   MyJobOffers: list of:
                -   JobOffer
                -   Link to JobOfferDetails
                    -   JobOfferDetails
                    -   Link to EditJobOfferForm
                -   EditJobOfferForm
            -   Link to NewJobOfferForm
            -   NewJobOfferForm
    -   ExplorePage
        -   SearchBox
        -   PortfolioImageList:
            -   PortfolioImage
            -   Link to Portfolio (a PortfolioImage have the artist id)
                -   Portfolio
                -   Link to EditPortfolioForm => if artist equals the user seeing it/session user
                -   Link to ContactForm => if recruiter user
    -   JobOffersPage
        -   SearchBox
        -   JobOfferList:
            -   JobOffer
            -   Link to JobOfferDetails
                -   JobOfferDetails
                -   Link to EditJobOfferForm => if recruiter equals the user seeing it/session user
                -   ApplyButton
                -   QuitButton
    -   Footer

<!--  -->
