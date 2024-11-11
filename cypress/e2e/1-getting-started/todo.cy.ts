/// <reference types="cypress" />
import { qase } from "cypress-qase-reporter/mocha"

describe("example to-do app", { tags: ["@stg"] }, () => {
  beforeEach(() => {
    cy.visit("https://example.cypress.io/todo");
  });

  qase(
    [1],
    it("displays two todo items by default", { tags: ["@electron"] }, () => {
      cy.get(".todo-list li").should("have.length", 2);
      cy.get(".todo-list li").first().should("have.text", "Pay electric bill");
      cy.get(".todo-list li").last().should("have.text", "Walk the dog");
    })
  )

  qase(
    [2],
    it("can add new todo items", () => {
      const newItem = "Feed the cat";
      cy.get("[data-test=new-todo]").type(`${newItem}{enter}`);
      cy.get(".todo-list li")
        .should("have.length", 3)
        .last()
        .should("have.text", newItem);
    })
  )
});
