/* global faker */

// we are French
faker.locale = 'fr';

var randomFirstName = faker.name.firstName();
var randomLastName = faker.name.lastName();
var randomEmail = faker.internet.email();

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    document.querySelector('[name=first_name]').value = randomFirstName;
    document.querySelector('[name=last_name]').value = randomLastName;
    document.querySelector('[name=email]').value = randomEmail;
});
