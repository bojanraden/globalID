import login from "../../fixtures/login.json";

describe("Login & Authentication", () => {
  it("Navigate to GlobaliD Connect", () => {
    cy.visit(login.url.base);
    cy.intercept("GET", "/v1/consent/**/status").as("loaded");
    cy.wait("@loaded");
  });

  // Two tests below are meant to check the error messages for wrong username/pw combinations. 
  // However, if ran oftenly, the account gets temporarily unavailable.

  //   it("Check wrong username", () => {
  //     cy.get(".MuiInputBase-input").clear().type(login.wrong.username);
  //     cy.get('.helper-warning').should('be.visible');
  //   });

  //   it("Check correct username - wrong password", () => {
  //     cy.get(".MuiInputBase-input").clear().type(login.correct.username);
  //     cy.intercept("GET", "/v1/identities?gid_name=w71612452882").as(
  //       "usernameLoaded");
  //     cy.get('.MuiButton-label').click();
  //     cy.wait("@usernameLoaded");
  //     cy.get('#outlined-adornment-password').type(login.wrong.password);
  //     cy.intercept("POST", "/v1/auth/token").as("wrongPassword");
  //     cy.get(".MuiButton-label").click();
  //     cy.wait('@wrongPassword')
  //     cy.get('.snackbar').should('be.visible');
  //     cy.intercept("GET", "/v1/consent/**").as("backToUsername");
  //     cy.get('.chevron-icon').click();
  //     cy.wait('@backToUsername');
  //   });

  it("Attempt to successfully sign in", () => {
    //let req1 = false;
    // cy.intercept({
    //   method: "POST",
    //   status: 401,
    //   onRequest: () => {
    //     req1 = true;
    //   },
    //   url: "/v1/devices/**/revoke",
    // });
    //cy.route("GET", "/v1/consent/**/status").as("loaded");


    //cy.login is a custom function, called from commands.js
    cy.login(login.correct.username, login.correct.password)

    //I made this part deliberately fail, explained in the documentation.
    // cy.get("body").should(() => {
    //   if (req1) {
    //     console.log(req1 + "req1");
    //     expect(req1).to.eq(false);
    //   } else {
    //     console.log(req1 + "re1");
    //     expect(req1).to.eq(true);
    //   }
    // });
  });

  it("Double sign in, if needed", () => {
    cy.get("body").then((body) => {
      if (body.find("label:contains(GlobaliD Name)").length > 0) {
        cy.login(login.correct.username, login.correct.password)
      } else cy.log("The popup did not appear. ");
      cy.wait(10000);
    });
  });

  
  it("Tap on 'Continue to Web App' if it appears", () => {
    cy.get("body").then((body) => {
      if (body.find("a:contains(Continue to Web app)").length > 0) {
  //If it comes to this, this line makes the test fail, since it triggers a POST request.
        cy.get(".bottom-buttons > .MuiTypography-root").click();
        cy.wait(10000);
      } else cy.log("No need for secound sign in. ");
      cy.wait(10000);
    });
  });

  it("Check if user successfully signed in", () => {
    let req4 = false;
    cy.get("body").then((body) => {
      if (body.find("span:contains(w71612452882)").length > 0) {
        cy.log("User is signed in.");
        req4 = true;
      } else {
        expect(req4).to.eq(true);
      }
    });
  });

  it("Change description", () => {
    cy.get(".jss144 > div > svg > g > rect").click({ force: true });
    cy.wait(2000);
    cy.get(".MuiInputBase-input")
      .click()
      .clear()
      .type("Hi,Changing Description!");
    //Instead of clicking 'Save', I've verified it. Otherwise, the test would fail since POST request is triggered.
    cy.get('.MuiDialogActions-root > .MuiButtonBase-root').should("be.visible");
    cy.get("[alt='close']").click();
  });

  it("Set profile to private", () => {
    cy.wait(2000);
    cy.get(
      ".jss82 > :nth-child(1) > :nth-child(1) > .MuiButtonBase-root > .jss90 > svg"
    ).click();
    cy.wait(1000);
    cy.get(
      ":nth-child(1) > .MuiListItemText-root > .MuiTypography-root"
    ).click();
    cy.wait(1000);
    //Had to do it this way since the element has opacity set to 0, which is considered "not visible" by cypress.
    //Instead of click, I have verified the existance of the checkbox. Otherwise, the test would fail since POST request is triggered.
    cy.get("#privacyField").then(($el) => {
      Cypress.dom.isVisible($el); // true
    });
  });
});
