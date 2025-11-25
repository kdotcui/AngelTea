/// <reference types="cypress" />

describe('Mines Game', () => {
  it('should load the Mines page', () => {
    cy.visit('/mines', { failOnStatusCode: false });
    cy.contains('Mines', { timeout: 10000 }).should('exist');
  });

  it('should show sign in prompt when not authenticated', () => {
    cy.clearLocalStorage();
    cy.visit('/mines', { failOnStatusCode: false });
    cy.contains('Sign In', { timeout: 10000 }).should('be.visible');
  });

  it('should display Start Game button when authenticated', () => {
    const mockSession = {
      userId: 'test-user-123',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      authenticatedAt: Date.now(),
    };

    cy.visit('/mines', { failOnStatusCode: false });
    cy.window().then((win) => {
      win.localStorage.setItem('gameSession', JSON.stringify(mockSession));
    });
    cy.reload();

    cy.contains('button', 'Start Game', { timeout: 10000 }).should('exist');
  });

  it('should display game stats panel', () => {
    const mockSession = {
      userId: 'test-user-123',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      authenticatedAt: Date.now(),
    };

    cy.visit('/mines', { failOnStatusCode: false });
    cy.window().then((win) => {
      win.localStorage.setItem('gameSession', JSON.stringify(mockSession));
    });
    cy.reload();

    cy.contains('Multiplier', { timeout: 10000 }).should('exist');
    cy.contains('Revealed').should('exist');
    cy.contains('Mines').should('exist');
  });

  it('should show 5x5 grid after starting game', () => {
    const mockSession = {
      userId: 'test-user-123',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      authenticatedAt: Date.now(),
    };

    cy.visit('/mines', { failOnStatusCode: false });
    cy.window().then((win) => {
      win.localStorage.setItem('gameSession', JSON.stringify(mockSession));
    });
    cy.reload();

    cy.contains('button', 'Start Game', { timeout: 10000 }).click();
    
    // Should have 25 tiles (5x5 grid)
    cy.get('button[class*="aspect-square"]', { timeout: 5000 })
      .should('have.length', 25);
  });

  it('should display Cash Out button during game', () => {
    const mockSession = {
      userId: 'test-user-123',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      authenticatedAt: Date.now(),
    };

    cy.visit('/mines', { failOnStatusCode: false });
    cy.window().then((win) => {
      win.localStorage.setItem('gameSession', JSON.stringify(mockSession));
    });
    cy.reload();

    cy.contains('button', 'Start Game', { timeout: 10000 }).click();
    cy.contains('button', 'Cash Out', { timeout: 5000 }).should('exist');
  });
});

