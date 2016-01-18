// namespace
var mouvy = mouvy || {};


document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // START HACKING
    var depEmails = mouvy.hacking.repEmails;
    var gouvEmails = mouvy.hacking.gouvEmails;

    // handle the departement list creation
    var departementList = [];
    for (var key in depEmails) {
        if (depEmails.hasOwnProperty(key)) {
            departementList.push({key: key, name: depEmails[key].name});
        }
    }
    departementList.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });

    var departementSelect = document.getElementById('your-departement');
    departementList.forEach(function(el) {
        var opt = document.createElement('option');
        opt.value = el.key;
        opt.innerHTML = el.name;
        departementSelect.appendChild(opt);
    });

    var representativeEmailsInput = document.getElementById('your-representatives');
    var $representativeEmailsInputInstance = $(representativeEmailsInput).selectize({
        delimiter: ';',
        // valueField: 'email',
        // labelField: 'email',
        // searchField: ['email'],
        create: function(input) {
            return {
                value: input,
                text: input
            };
        }
    });

    // when a departement is selected, fill the representative emails
    var lastRepresentativeEmails = [];
    $(departementSelect).selectize({
        onChange: function() {
            var selectedDepNumber = departementSelect.value;
            var emails = depEmails[selectedDepNumber].emails;
            var additionalEmails = gouvEmails;

            Array.prototype.push.apply(emails, additionalEmails);
            lastRepresentativeEmails = emails;

            // representativeEmailsInput.value = emails.join('; ');
            var selector = $representativeEmailsInputInstance[0].selectize;
            selector.clearOptions();
            selector.disable();
            emails.forEach(function(e) {
                selector.addOption({value: e, text: e});
                selector.addItem(e);
            });
        }
    });

    // on inbox choice, we load the redirect with the right content
    /*jslint quotmark: double */
    var message = "Chers membres du gouvernement, députés, sénateurs,\n\
\n\
J’ai signé le manifeste du Mouvement Y.\n\
\n\
Depuis que j'ai l'âge d'écouter les infos, je vois le monde changer à une vitesse folle et mon pays, lui, semble prostré. Non pas qu'il refuse le changement par principe, mais il ne fait confiance à personne pour ça. Et pour cause, la classe politique, décrédibilisée par les affaires et le non-renouvellement, est devenue impuissante. Elle colmate sans prendre de risques, pour ne pas nous fâcher davantage. \n\
\n\
Alors, pourquoi aller voter ? Qu'espérer de plus à l'élection suivante ? Comme la plupart de mes contemporains, je n'ai plus envie de me déplacer aux urnes. Les campagnes électorales et leurs acteurs semblent appartenir à une autre époque. La politique française vit un décalage effrayant avec son temps et les attentes qu'elle suscite.\n\
\n\
Parce qu'on ne peut pas se résoudre à attendre éternellement et parce que l'action politique semble paralysée sans élan populaire, voici trois propositions de réforme indispensables. Des propositions concrètes, sans étiquette, applicables rapidement et approuvées par des experts (juristes, politologues de bords différents) pour réveiller enfin notre système politique, le renouveler en profondeur, bref, le rendre à nouveau acceptable.\n\
\n\
1/ Ethique : Instaurer une peine incompressible de 6 ans pour les élus fraudeurs\n\
2/ Renouvellement : limiter à trois le nombre de mandats identiques qu'un élu peut cumuler dans le temps \n\
3/ Rationalisation : remettre à plat le mode de financement des parlementaires\n\
\n\
Nous ne sommes pas des adeptes du « tous pourris ». Nous n'oublions pas que l'immense majorité des élus locaux fait son travail avec dignité, mais je vous demande de faire le nécessaire pour que ces propositions essentielles soient soumises au vote.\n\
\n\
Merci.";
    /*jslint quotmark: single */

    var subject = 'Prenez vos responsabilités';
    var inboxShortcutButtons = document.querySelectorAll('.hk-through-inbox');
    Array.prototype.forEach.call(inboxShortcutButtons, function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault();

            var targetUrl;
            var params, query;
            if (el.id === 'hk-through-gmail') {
                
                // GMAIL
                params = {
                    'view': 'cm',
                    'fs': '1',
                    'to': lastRepresentativeEmails.join(';'),
                    'su': subject,
                    'body': message
                };
                query = mouvy.urlEncodeParams(params);
                targetUrl = 'https://mail.google.com/mail/?' + query;

            } else if (el.id === 'hk-through-other') {

                // default inbox
                var to = lastRepresentativeEmails.join(';');
                params = {
                    'subject': subject,
                    'body': message
                };
                query = mouvy.urlEncodeParams(params);
                targetUrl = 'mailto:' + encodeURIComponent(to) + '?' + query;

            }

            if (targetUrl) {
                el.setAttribute('href', targetUrl);

                // try to get an estimate of the number of emails sent
                // nothing more than that is tracked
                if (window.ga) {
                    window.ga('send', 'event', 'hacking', 'mails', 'sent', lastRepresentativeEmails.length);
                }

                // simulate click
                // var event = document.createEvent('HTMLEvents');
                // event.initEvent('click', true, false);
                // el.dispatchEvent(event);
                window.open(targetUrl);
            } else {
                // no target url, so we open the modal view for copy/paste
                mouvy.showModal(e.target, function(modal) {
                    var emailField = modal.modalElem().querySelector('#hk-manual-emails');
                    var subjectField = modal.modalElem().querySelector('#hk-manual-subject');
                    var contentField = modal.modalElem().querySelector('#hk-manual-content');

                    // fill the emails
                    emailField.value = lastRepresentativeEmails.join(';');
                    subjectField.value = subject;
                    contentField.innerHTML = message;

                    // bind the focus event to select all the text
                    emailField.addEventListener('focus', function() {
                        emailField.select();
                    }, false);
                    subjectField.addEventListener('focus', function() {
                        subjectField.select();
                    }, false);
                    contentField.addEventListener('focus', function() {
                        contentField.select();
                    }, false);
                });
            }
        });
    });
    // END HACKING

});
