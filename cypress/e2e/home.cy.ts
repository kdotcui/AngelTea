/// <reference types="cypress" />

describe('Home page', () => {
  it('should load the homepage', () => {
    cy.visit('/', { failOnStatusCode: false });
    cy.contains('Angel Tea', { timeout: 10000 }).should('exist');
  });
});


