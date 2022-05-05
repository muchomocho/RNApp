export const formatToFormdata = (body) => {
    var formdata = new FormData();
    console.log(body)
    const extra = [];
    var arr = body.nutrient_data;
    var newBody = body;
    arr = arr.map((element, index) => {
        console.log(element.name)
        if (element.name == 'energy') {
            console.log('isenergy')
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
            console.log({name: newname,
                value: element.value,
                unit: element.unit})
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
    console.log('ex', extra)
    console.log('arr', arr)
    newBody.nutrient_data = arr;

    const formatArray = (formdata, arrayKey, value) => {
        if (typeof(value) !== 'object' || typeof(value) == null || typeof(value) == undefined) {
            if (typeof(value) == 'string' && value.match(/^\d+(\.\d{1,20})?$/)) {
                console.log('match', value)
                return formdata.append(`${arrayKey}`, parseFloat(value));
            }
            return formdata.append(`${arrayKey}`, value);
        }
        for (var key in value) {
            console.log('key', key)
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
    
    
    for (var key in newBody) {
        if (Object.prototype.hasOwnProperty.call(newBody, key)) {
            formatArray(formdata, key, newBody[key]);
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

export const lessThanNutrients = ['free_sugars', 'fat', 'saturated_fat', 'energy_kj', 'energy_kcal', 'salt']