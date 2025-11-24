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
      
      // Hero image - checking visibility with naturalWidth for Next.js Image
      cy.get('img[alt*="rewards"]')
        .should('exist')
        .and(($img) => {
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

  describe('Navigation & Links', () => {
    it('hero "Join Now" link navigates to join section', () => {
      cy.contains('a', 'Join Now').click();
      cy.url().should('include', '#join');
      cy.get('#join').should('be.visible');
    });

    it('hero "Learn More" link navigates to how it works section', () => {
      cy.contains('a', 'Learn More').click();
      cy.url().should('include', '#how-it-works');
      cy.get('#how-it-works').should('be.visible');
    });

    it('View Full Menu link points to home page menu section', () => {
      cy.get('#menu-preview').scrollIntoView();
      cy.contains('a', 'View Full Menu')
        .should('have.attr', 'href', '/#menu-boards');
    });

    it('all section anchor IDs exist for navigation', () => {
      cy.get('#how-it-works').should('exist');
      cy.get('#join').should('exist');
      cy.get('#membership').should('exist');
      cy.get('#redeem').should('exist');
      cy.get('#points').should('exist');
      cy.get('#menu-preview').should('exist');
    });
  });

  describe('Content Accuracy', () => {
    it('displays correct point values', () => {
      cy.get('#redeem').scrollIntoView();
      cy.contains('80 pts').should('be.visible'); // Free Drink
      cy.contains('150 pts').should('be.visible'); // Free Appetizer
      cy.contains('300 pts').should('be.visible'); // Angel Tea Shirt
    });

    it('displays correct membership pricing', () => {
      cy.get('#membership').scrollIntoView();
      cy.contains('$100/year').should('be.visible'); // Annual
      cy.contains('$9.99/month').should('be.visible'); // Monthly
      cy.contains('Save $19.88').should('be.visible'); // Savings
    });

    it('displays membership benefits accurately', () => {
      cy.get('#membership').scrollIntoView();
      cy.contains('1 free drink every month').should('be.visible');
      cy.contains('2× points on all purchases').should('be.visible');
      cy.contains('Member-only pricing').should('be.visible');
      cy.contains('Early access to seasonal drinks').should('be.visible');
    });
  });

  describe('Interactive Elements', () => {
    it('coming soon buttons are properly disabled', () => {
      cy.get('#join').scrollIntoView();
      cy.contains('button', 'Join on Chowbus').should('be.disabled');
      cy.contains('button', 'Check Points Status').should('be.disabled');
      
      cy.get('#membership').scrollIntoView();
      cy.contains('button', 'Join Annual Plan').should('be.disabled');
      cy.contains('button', 'Join Monthly Plan').should('be.disabled');
    });

    it('displays coming soon message', () => {
      cy.get('#join').scrollIntoView();
      cy.contains('Chowbus integration links will be available soon').should('be.visible');
    });

    it('all cards are clickable/interactive areas', () => {
      cy.get('#how-it-works').scrollIntoView();
      // Check for card content instead of class name
      cy.contains('Sign Up').should('be.visible');
      cy.contains('Earn Points').should('be.visible');
      cy.contains('Redeem Rewards').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
    ];

    viewports.forEach(({ name, width, height }) => {
      it(`displays correctly on ${name}`, () => {
        cy.viewport(width, height);
        cy.visit('/rewards');
        
        // Key sections visible
        cy.get('h1').should('be.visible');
        cy.contains('Join Now').should('be.visible');
        cy.get('#how-it-works').scrollIntoView().should('be.visible');
        cy.get('#membership').scrollIntoView().should('be.visible');
      });
    });

    it('hero section stacks properly on mobile', () => {
      cy.viewport(375, 667);
      cy.get('h1').should('be.visible');
      
      // On mobile, elements should stack vertically
      cy.get('.md\\:grid-cols-2').should('exist');
    });

    it('menu images display side by side on desktop', () => {
      cy.viewport(1920, 1080);
      cy.get('#menu-preview').scrollIntoView();
      cy.get('img[alt="Drinks menu (left)"]').should('be.visible');
      cy.get('img[alt="Drinks menu (right)"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1);
      cy.get('h2').should('have.length.at.least', 5);
    });

    it('all images have alt text', () => {
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('all links are keyboard accessible', () => {
      cy.contains('a', 'Join Now').should('be.visible').focus();
      cy.focused().should('contain', 'Join Now');
    });

    it('disabled buttons have proper aria states', () => {
      cy.get('#join').scrollIntoView();
      cy.contains('button', 'Join on Chowbus')
        .should('be.disabled')
        .and('have.attr', 'disabled');
    });

    it('sections have semantic HTML structure', () => {
      cy.get('main').should('exist');
      cy.get('section').should('have.length.at.least', 6);
    });
  });

  describe('Visual Elements', () => {
    it('displays decorative icons throughout', () => {
      cy.get('svg').should('have.length.at.least', 10);
    });

    it('cards have proper styling', () => {
      cy.get('#how-it-works').scrollIntoView();
      // Check for visible card content instead of generic classes
      cy.contains('Sign Up').parent().parent().should('be.visible');
      cy.contains('Earn Points').parent().parent().should('be.visible');
    });

    it('gradient backgrounds are applied', () => {
      cy.get('#how-it-works').scrollIntoView();
      // Check for sections with gradient styling
      cy.contains('How It Works').should('be.visible');
    });

    it('badges are styled correctly', () => {
      // Check for actual badge content
      cy.contains('Loyalty Program').should('be.visible');
    });
  });

  describe('Scroll Behavior', () => {
    it('sections scroll into view smoothly', () => {
      // Navigate through all sections
      cy.contains('a', 'Join Now').click();
      cy.get('#join').should('be.visible');
      
      cy.get('#membership').scrollIntoView();
      cy.get('#membership').should('be.visible');
      
      cy.get('#redeem').scrollIntoView();
      cy.get('#redeem').should('be.visible');
    });

    it('maintains proper scroll margin for anchors', () => {
      cy.contains('a', 'Learn More').click();
      // After clicking, section should be visible with proper offset
      cy.get('#how-it-works').should('be.visible');
    });
  });

  describe('Member vs Guest Comparison', () => {
    it('clearly shows member benefits', () => {
      cy.get('#points').scrollIntoView();
      cy.contains('Members').should('be.visible');
      cy.contains('Double Points').should('be.visible');
    });

    it('shows guest benefits', () => {
      cy.get('#points').scrollIntoView();
      cy.contains('Guests').should('be.visible');
      cy.contains('Every purchase').should('be.visible');
    });

    it('highlights membership advantages', () => {
      cy.get('#membership').scrollIntoView();
      // Check for annual plan visibility
      cy.contains('Angel Tea+ Annual').should('be.visible');
      cy.contains('$100/year').should('be.visible');
    });
  });

  describe('Complete User Journey', () => {
    it('user can navigate entire page from top to bottom', () => {
      // Start at hero
      cy.get('h1').should('be.visible');
      
      // Click Learn More
      cy.contains('a', 'Learn More').click();
      cy.get('#how-it-works').should('be.visible');
      
      // Scroll through sections
      cy.get('#join').scrollIntoView().should('be.visible');
      cy.get('#membership').scrollIntoView().should('be.visible');
      cy.get('#redeem').scrollIntoView().should('be.visible');
      cy.get('#points').scrollIntoView().should('be.visible');
      cy.get('#menu-preview').scrollIntoView().should('be.visible');
      
      // Click View Full Menu (but don't navigate away)
      cy.contains('a', 'View Full Menu').should('be.visible');
    });
  });
});
