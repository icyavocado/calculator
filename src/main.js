'use strict';

class Calculator {
    constructor(initNum) {
        this.history = [];
        this.init(initNum);
    }

    init(preserveStr) {
        this.updateExpression(preserveStr || '');
    }

    updateExpression(str) {
        this.expression = str;
        if (this.render) this.render();
    }

    appendExpression(str) {
        this.updateExpression(this.expression + str);
    }

    tokenize(expression) {
        const tokens = [];
        let num = "";

        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];

            if (/\d|\./.test(char)) {
                num += char;
            } else if (['+', '-', '*', '/', '%'].includes(char)) {
                if (num) {
                    tokens.push({
                        type: 'num',
                        str: num
                    });
                    num = "";
                }
                tokens.push({
                    type: 'operator',
                    str: char
                });
            }
        }

        if (num) tokens.push({
            type: 'num',
            str: num
        });

        return tokens;
    }

    convertPercentage(expression) {
        if (typeof expression !== 'string') return expression;
        return expression.replaceAll(/\%/g, '/ 100');
    }

    get result() {
        let expression = this.convertPercentage(this.expression);
        const tokens = this.tokenize(expression);

        const values = [];
        const operators = [];


        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            if (token.type === 'num') {
                values.push(Number.parseFloat(token.str));
            } else if (token.type === 'operator') {
                while (
                    operators.length
                    && this.precedence(operators[operators.length - 1]) >= this.precedence(token.str)
                ) {
                    this.applyOperator(operators, values);
                }
                operators.push(token.str);
            }
        }

        while (operators.length) {
            this.applyOperator(operators, values);
        }

        return values.pop();
    }

    applyOperator(operators, values) {
        const operator = operators.pop();

        const right = values.pop();
        const left = values.pop();
    
        switch (operator) {
            case '+':
                values.push(left + right);
                break;
            case '-':
                values.push(left - right);
                break;
            case '*':
                values.push(left * right);
                break;
            case '/':
                values.push(left / right);
                break;
        }
    }

    precedence(op) {
        if (['+', '-'].includes(op)) return 1;
        if (['*', '/', '%'].includes(op)) return 2;
        return 0;
    }
    
    addHistory() {
        this.history.push({
            expression: this.expression,
            result: this.result
        });
    }

    loadHistory(history) {
        this.updateExpression(history.expression);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const calc = new Calculator();
    const wrapper = document.getElementById('wrapper');
    const calculator = wrapper.querySelector('#calculator');
    const primaryDisplay = calculator.querySelector('.display .primary-display');
    const secondaryDisplay = calculator.querySelector('.display .secondary-display');

    calculator.querySelectorAll('.num').forEach(num => num.addEventListener('click', function() {
        calc.appendExpression(this.textContent);
    }));

    calculator.querySelectorAll('.operation').forEach(op => op.addEventListener('click', function() {
        calc.appendExpression(' ' + this.textContent + ' ');
    }));

    calculator.querySelector('.equal').addEventListener('click', function() {
        calc.addHistory();
        calc.renderHistoryList();
        secondaryDisplay.textContent = calc.expression;
        calc.init(calc.result.toString());
    });

    calculator.querySelector('.clear').addEventListener('click', function() {
        calc.init('0');
    });

    calc.render = function() {
        primaryDisplay.textContent = calc.expression;
    }

    calc.renderHistoryList = function(cal) {
        let historyListGroup = document.querySelector('#history .list-group');
        historyListGroup.innerHTML = '';

        calc.history.forEach(entry => {
            const newList = document.createElement('li');
            newList.classList.add('list-group-item', 'clickable');
            newList.innerHTML = entry.result;
            newList._history = entry;
            newList.addEventListener('click', function() {
                calc.loadHistory(this._history);
                secondaryDisplay.textContent = calc.expression;
                calc.init(calc.result)
            })
            historyListGroup.appendChild(newList)
        });

    }
});