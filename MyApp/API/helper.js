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
                var newValueOther = parseFloat(element.value) * converterKcalToKj;
                newNameOther = `energy_kj`;
                newUnitOther = 'kj';
            } else {
                var newValueOther = parseFloat(element.value) / converterKcalToKj;
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