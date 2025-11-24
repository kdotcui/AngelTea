/// <reference types="cypress" />

describe('Rewards Page', () => {
  beforeEach(() => {
    cy.visit('/rewards');
  });

  describe('Page Structure & Rendering', () => {
    it('renders the hero section correctly', () => {
      // Hero title and description
      cy.get('h1').should('be.visible');
      cy.contains('Rewards Program').should('be.visible');
      cy.contains('Earn points with every purchase').should('be.visible');
      
      // Hero buttons
      cy.contains('a', 'Join Now').should('be.visible');
      cy.contains('a', 'Learn More').should('be.visible');
      
      // Hero image - checking visibility with a looser check for Next.js Image
      cy.get('img[alt*="rewards"]')
        .should('exist')
        .and(($img) => {
          // Check if the image is actually loaded and visible
          expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
        });
    });

    it('renders the "How It Works" section', () => {
      cy.get('#how-it-works').scrollIntoView().should('be.visible');
      cy.contains('How It Works').should('be.visible');
      
      // Should see 3 steps
      cy.contains('Sign Up').should('be.visible');
      cy.contains('Earn Points').should('be.visible');
      cy.contains('Redeem Rewards').should('be.visible');
    });

    it('renders the Chowbus integration section', () => {
      cy.get('#join').scrollIntoView().should('be.visible');
      cy.contains('Order with Chowbus').should('be.visible');
      
      // Benefits list
      cy.contains('Double points').should('be.visible');
      cy.contains('Track your order').should('be.visible');
    });

    it('renders the Membership Plans section', () => {
      cy.get('#membership').scrollIntoView().should('be.visible');
      cy.contains('Angel Tea Membership').should('be.visible');
      
      // Plan cards exist
      cy.contains('Annual').should('be.visible');
      cy.contains('Monthly').should('be.visible');
      
      // Benefits visible
      cy.contains('Free Drink Monthly').should('be.visible');
      cy.contains('Double Points').should('be.visible');
    });

    it('renders the Redeem Points section', () => {
      cy.get('#redeem').scrollIntoView().should('be.visible');
      cy.contains('Redeem Your Points').should('be.visible');
      
      // Redemption options
      cy.contains('Free Drink').should('be.visible');
      cy.contains('Free Appetizer').should('be.visible');
      cy.contains('Angel Tea Shirt').should('be.visible');
    });

    it('renders the Points Explanation section', () => {
      cy.get('#points').scrollIntoView().should('be.visible');
      cy.contains('How Points Work').should('be.visible');
      
      // Member vs Guest comparison
      cy.contains('Members').should('be.visible');
      cy.contains('Guests').should('be.visible');
    });

    it('renders the Menu Preview section', () => {
      cy.get('#menu-preview').scrollIntoView().should('be.visible');
      cy.contains('Start Earning Today').should('be.visible');
      
      // Menu images - using alt text selector which is more reliable than src with Next.js optimization
      cy.get('img[alt="Drinks menu (left)"]')
        .should('exist')
        .and(($img) => {
          expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
        });
        
      cy.get('img[alt="Drinks menu (right)"]')
        .should('exist')
        .and(($img) => {
          expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
        });
      
      // View menu button
      cy.contains('a', 'View Full Menu').should('be.visible');
    });
  });
});
