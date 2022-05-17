export const formatToFormdata = (body) => {
    var formdata = new FormData();
 
    const extra = [];

    if (Object.prototype.hasOwnProperty.call(body, 'nutrient_data')) {
        var arr = body.nutrient_data;
        arr = arr.map((element, index) => {

            if (element.name == 'energy') {
    
                const newname = `${element.name}_${element.unit}`
                var newValueOther = 0;
                var newNameOther = '';
                var newUnitOther = '';
                const converterKcalToKj = 4.184
                if (element.unit == 'kcal') {
                    var newValueOther = (parseFloat(element.value) * converterKcalToKj).toFixed(0);
                    newNameOther = `energy_kj`;
                    newUnitOther = 'kj';
                } else {
                    var newValueOther = (parseFloat(element.value) / converterKcalToKj).toFixed(0);
                    newNameOther = `energy_kcal`;
                    newUnitOther = 'kcal';
                }
                extra.push({
                    name: newNameOther,
                    value: newValueOther,
                    unit: newUnitOther
                });

                return {
                    name: newname,
                    value: element.value,
                    unit: element.unit
                }
            }
            return {
                ...element,
                name: element.name.replace(' ', '_'),
            }
        });
        if (extra.length > 0) {
            arr = arr.concat(extra);
        }

        body.nutrient_data = arr;
    }

    const formatArray = (formdata, arrayKey, value) => {
        if (typeof(value) !== 'object' || typeof(value) == null || typeof(value) == undefined) {
            if (typeof(value) == 'string' && value.match(/^\d+(\.\d{1,20})?$/)) {
             
                return formdata.append(`${arrayKey}`, parseFloat(value));
            }
            return formdata.append(`${arrayKey}`, value);
        }
        for (var key in value) {
      
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                if (Array.isArray(value)) {
                    formatArray(formdata, `${arrayKey}[${key}]`, value[key]);
                }
                else {
                    formatArray(formdata, `${arrayKey}${key}`, value[key]);
                }
            }

        }
        return formdata;
    };
    
    
    for (var key in body) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
            formatArray(formdata, key, body[key]);
        }
    }

    return formdata;
}

export const amountFormatter = (value) => {
    var newValue = value.replace(/\.[0]+$/, '').replace(/(\.[0]*[1-9]+)([0]+)$/, '$1');
    return newValue;
};

// function format gender as string from api json
export const genderMap = (genderChar) => {
    if (genderChar === 'M') {
        return "male";
    } 
    if (genderChar === 'F') {
        return "female";
    }
    else return "other";
};

// function to return recommended nutrition amount from age
export const ageMap = (age) => {
    if (age === 3 ) {
        return 2;
    }
    if (age === 6) {
        return 5;
    }
    if (age > 7 && age < 11) {
        return 7;
    }
    if (age > 11 && age < 15) {
        return 11;
    }
    if (age > 15 && age < 19) {
        return 15;
    }
    if (age > 19 && age < 50) {
        return 19;
    }
    if (age > 50 && age < 65) {
        return 50;
    }
    if (age > 65 && age < 75) {
        return 65;
    }
    if (age >= 75) {
        return 75;
    }
    else return age;
};

// format the date in the format we want to use YYYY-MM-DD
export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // jan = 0
    const day = date.getDate();

    const digitFormat = (someDate) => {
        return ((''+someDate).length < 2 ? '0' + someDate : someDate)
    };

    return (
        year + '-' + digitFormat(month) + '-' + digitFormat(day)
    );
};

export const unitConverter = (targetUnit, fromUnit) => {
    const multiplier = (unit) => {
        if (unit == 'g') return 1;
        if (unit == 'mg') return 1000;
        if (unit == 'microg') return 1000000;
    };

    if (target == from) {
        return 1;
    }
    
    return multiplier(targetUnit) / multiplier(fromUnit)
};

export const clean = (text) => {
    return text.replace('_kcal', '').replace('_kj', '').replace('_', ' ').trim();
};

export const lessThanNutrients = ['free_sugars', 'fat', 'saturated_fat', 'energy_kj', 'energy_kcal', 'salt']