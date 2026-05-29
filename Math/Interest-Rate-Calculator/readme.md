# Compound Interest & Growth Calculator

Interactive calculator with live formula substitution, exponential growth chart, and Socratic quiz mode.

**[Open the app](index.html)**

Making an interest rate calculator with the correct formulas and drop down menu to display how the formula changes based on the inputs

Review of Compound Interest (Precalculus - College Algebra 65) :
https://www.youtube.com/watch?v=N1k25doMFww&list=PLDesaqWTN6ESsmwELdrzhcGiRhk5DjwLP&index=67
### Review of Compound Interest

Compound interest occurs when interest is earned not only on the initial principal but also on the interest accumulated from previous periods. In this lecture, Professor Leonard covers the two primary formulas used to calculate future value based on how often interest is applied.

---
#### 1. Discrete Compound Interest Formula
This formula is used when interest is compounded at specific intervals (annually, monthly, daily, etc.).

$$A = P\left(1 + \frac{r}{n}\right)^{nt}$$

**Variables Defined:**
* **$A$:** Future Value (the amount of money in the account after $t$ years).
* **$P$:** Principal (the initial amount invested or borrowed).
* **$r$:** Annual Interest Rate (must be expressed as a **decimal**; e.g., $5\% = 0.05$).
* **$n$:** Number of compounding periods per year.
* **$t$:** Time in **years**.

**Common Values for $n$:**
* Annually: $n = 1$
* Semi-annually: $n = 2$
* Quarterly: $n = 4$
* Monthly: $n = 12$
* Daily: $n = 365$

---
#### 2. Continuous Compound Interest Formula
As the number of compounding periods ($n$) approaches infinity, we transition from discrete compounding to continuous compounding. This involves the mathematical constant $e$ (Euler's number, $\approx 2.718$).

$$A = Pe^{rt}$$

**When to use:** Use this formula only when the problem explicitly states interest is compounded **"continuously."**
