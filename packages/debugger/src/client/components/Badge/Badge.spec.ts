import { Number_content, Text_content } from './Badge.mocks';
import { NUMERIC_MAX_SIGN, STRING_MAX_SIGN } from './useBadge';

describe('Badge', () => {
  it('should contain correct textual value', () => {
    cy.visit('http://localhost:6006/iframe.html?id=components-badge--text');
    cy.get('.badge').should('have.text', Text_content);
  });

  it('should contain correct numeric value', () => {
    cy.visit('http://localhost:6006/iframe.html?id=components-badge--number');
    cy.get('.badge').should('have.text', Number_content);
  });

  it('should contain correct textual value, even when `max` is reached', () => {
    cy.visit('http://localhost:6006/iframe.html?args=&id=components-badge--max-length-text');
    cy.get('.badge').should('have.text', Text_content);
    cy.get('.badge').should('have.data', 'displayContent', 'Text');
    cy.get('.badge').should('have.data', 'maxSign', STRING_MAX_SIGN);
  });

  it('should contain correct numeric value, even when `max` is reached', () => {
    cy.visit('http://localhost:6006/iframe.html?args=&id=components-badge--capped-number');
    cy.get('.badge').should('have.text', Number_content);
    cy.get('.badge').should('have.data', 'displayContent', 99);
    cy.get('.badge').should('have.data', 'maxSign', NUMERIC_MAX_SIGN);
  });
});
