# Simple Genetic Algorithm

This is a simple and naive implementation of genetic programming. 
It's based on what I learned from the first part of [The Field Guide To Genetic Programming](http://www.gp-field-guide.org.uk/).
I wanted to make sure I understood the basic concepts before moving on to the more advanced material in the book.

* This implementation tries to match the following function `y = (x * x) + x + 1`.
* The initial population uses a ramped half and half (grow and full methods) from 2 - 6 depth.
* Population size is 10000
* The individual error is total sum of the errors of all the tested samples.
* Parents are the 100 individuals with the lowest errors.
* The new population is created using subtree mutation on the parents.
* Function set: ADD, SUBTRACT, MULTIPLY, DIVIDE
* Terminal set: 5 constant terms, 1 input term (X).


