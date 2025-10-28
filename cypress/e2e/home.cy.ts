/// <reference types="cypress" />

describe('Home page', () => {
  it('renders the Angel Tea text', () => {
    cy.visit('/');
    cy.contains('Angel Tea').should('be.visible');
  });
});


