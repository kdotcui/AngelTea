/// <reference types="cypress" />

describe('Plinko Game', () => {
  it('should load the Plinko page', () => {
    cy.visit('/plinko', { failOnStatusCode: false });
    cy.contains('Plinko', { timeout: 10000 }).should('exist');
  });

  it('should show sign in prompt when not authenticated', () => {
    cy.clearLocalStorage();
    cy.visit('/plinko', { failOnStatusCode: false });
    cy.contains('Sign In', { timeout: 10000 }).should('be.visible');
  });

  it('should display the game canvas when authenticated', () => {
    // Mock an authenticated session
    const mockSession = {
      userId: 'test-user-123',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      authenticatedAt: Date.now(),
    };

    cy.visit('/plinko', { failOnStatusCode: false });
    cy.window().then((win) => {
      win.localStorage.setItem('gameSession', JSON.stringify(mockSession));
    });
    cy.reload();

    cy.get('canvas', { timeout: 10000 }).should('exist');
  });

  it('should display Drop Ball button', () => {
    const mockSession = {
      userId: 'test-user-123',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      authenticatedAt: Date.now(),
    };

    cy.visit('/plinko', { failOnStatusCode: false });
    cy.window().then((win) => {
      win.localStorage.setItem('gameSession', JSON.stringify(mockSession));
    });
    cy.reload();

    cy.contains('button', 'Drop Ball', { timeout: 10000 }).should('exist');
  });

  it('should show plays remaining counter', () => {
    const mockSession = {
      userId: 'test-user-123',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      authenticatedAt: Date.now(),
    };

    cy.visit('/plinko', { failOnStatusCode: false });
    cy.window().then((win) => {
      win.localStorage.setItem('gameSession', JSON.stringify(mockSession));
    });
    cy.reload();

    cy.contains('Plays Remaining', { timeout: 10000 }).should('exist');
  });
});

