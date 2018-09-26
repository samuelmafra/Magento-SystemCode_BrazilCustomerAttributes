define([
    'underscore',
    'ko',
    'uiRegistry',
    'Magento_Ui/js/form/element/abstract',
    'jquery',
    'inputMask',
    'mage/url',
], function (_, ko, registry, Abstract, jquery, mask, url) {
    'use strict';

    var checkoutLoader = jquery('#checkout-loader');

    return Abstract.extend({
        defaults: {
            loading: ko.observable(false),
            imports: {
                update: '${ $.parentName }.country_id:value'
            }
        },

        initialize: function () {
            
            
            this._super();
            //jquery('#'+this.uid).mask('00000-000', {clearIfNotMatch: true});
            return this;
        },

        /**
         * @param {String} value
         */
        update: function (value) {
            var country = registry.get(this.parentName + '.' + 'country_id'),
                options = country.indexedOptions,
                option;

            if (!value) {
                return;
            }
            
           

            if(options[value]){
                option = options[value];

                if (option['is_zipcode_optional']) {
                    this.error(false);
                    this.validation = _.omit(this.validation, 'required-entry');
                } else {
                    this.validation['required-entry'] = true;
                }

                this.required(!option['is_zipcode_optional']);

            }

            this.firstLoad = true;
        },


        onUpdate: function () {
            this.bubble('update', this.hasChanged());
            var validate = this.validate();
            //if(this.firstLoad){
            //    this.firstLoad = false;
            //    return;
            //}
            
            var country = jQuery("[name=country_id]").val()
            
            if (country=='BR') {
                jquery('#'+this.uid).mask('00000-000', {clearIfNotMatch: true});
            } else {
                jquery('#'+this.uid).unmask();
            }
            
            //alert(country);
            
            var value = this.value();
            value = value.replace('-', '');
            
            if(validate.valid == true && value && value.length == 8 && country =='BR'){
                jquery('#checkout').append(checkoutLoader);

                var element = this;
                
                var ajaxurl = url.build("brcustomer/consult/address/zipcode/"+value);

                jquery.getJSON(ajaxurl, null, function(data) {
                    if(data.error){
                        // TODO
                    }else{
                        if(registry.get(element.parentName + '.' + 'street.0')){
                            registry.get(element.parentName + '.' + 'street.0').value(data.street);
                        }
                        if(registry.get(element.parentName + '.' + 'street.2')){
                            registry.get(element.parentName + '.' + 'street.2').value(data.neighborhood);
                        }
                        if(registry.get(element.parentName + '.' + 'street.3')){
                            registry.get(element.parentName + '.' + 'street.3').value(data.complement);
                        }
                        if(registry.get(element.parentName + '.' + 'city')){
                            registry.get(element.parentName + '.' + 'city').value(data.city);
                        }
                        if(registry.get(element.parentName + '.' + 'region_id')){
                            registry.get(element.parentName + '.' + 'region_id').value(data.uf);
                        }
                        if(registry.get(element.parentName + '.' + 'country_id')){
                            registry.get(element.parentName + '.' + 'country_id').value('BR');
                        }
                        
                        jquery("[name=street\\[1\\]]").focus();
                    }
                    jquery('#checkout-loader').remove();
                    
                });
            }else{
                jquery('#checkout-loader').remove();
            }

        }
    });
});
