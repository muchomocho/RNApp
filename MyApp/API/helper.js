const printJson = async () => {
    const obj = {};
    var ageSet = 0;

    for (var i = 1; i <= 75; ++i) {
        if (i === 1 || i === 2 || i === 4 || i === 5 || i === 7 ||
            i === 11 || i === 15 || i === 19 || i === 50 || i === 65 || i === 75) {
                obj[i] = {};
                obj[i].male = dietDataContainer();
                obj[i].male.energy = energy[ageSet];
                obj[i].male.protein = protein[ageSet];
                obj[i].male.fat = fat[ageSet];
                obj[i].male.saturated_fat = saturated_fat[ageSet];
                obj[i].male.polyunsaturated_fat = polyunsaturated_fat[ageSet];
                obj[i].male.monounsaturated_fat = monounsaturated_fat[ageSet];
                obj[i].male.carbohydrate = carbohydrate[ageSet];
                obj[i].male.free_sugars = free_sugars[ageSet];
                obj[i].male.salt = salt[ageSet];
                obj[i].male.dietry_fibre = dietry_fibre[ageSet];
                obj[i].male.vitamin_a = vitamin_a[ageSet];
                obj[i].male.vitamin_b_12 = vitamin_b_12[ageSet];
                obj[i].male.folate = folate[ageSet];
                obj[i].male.vitamin_d = vitamin_d[ageSet];
                obj[i].male.thiamin = thiamin[ageSet];
                obj[i].male.riboflavin = riboflavin[ageSet];
                obj[i].male.niacin_equivalent = niacin_equivalent[ageSet];
                obj[i].male.vitamin_b_6 = vitamin_b_6[ageSet];
                obj[i].male.vitamin_c = vitamin_c[ageSet];
                obj[i].male.iron = iron[ageSet];
                obj[i].male.calcium = calcium[ageSet];
                obj[i].male.magnesium = magnesium[ageSet];
                obj[i].male.potassium = potassium[ageSet];
                obj[i].male.zinc = zinc[ageSet];
                obj[i].male.copper = copper[ageSet];
                obj[i].male.phosphorus = phosphorus[ageSet];
                obj[i].male.chloride = chloride[ageSet];
                obj[i].male.iodine = iodine[ageSet];
                obj[i].male.selenium = selenium[ageSet];
                obj[i].male.sodium = sodium[ageSet];

                if (i !== 4 && i !== 19) {
                    ++ageSet;
                }
                obj[i].female = dietDataContainer();
                obj[i].female.energy = energy[ageSet];
                obj[i].female.protein = protein[ageSet];
                obj[i].female.fat = fat[ageSet];
                obj[i].female.saturated_fat = saturated_fat[ageSet];
                obj[i].female.polyunsaturated_fat = polyunsaturated_fat[ageSet];
                obj[i].female.monounsaturated_fat = monounsaturated_fat[ageSet];
                obj[i].female.carbohydrate = carbohydrate[ageSet];
                obj[i].female.free_sugars = free_sugars[ageSet];
                obj[i].female.salt = salt[ageSet];
                obj[i].female.dietry_fibre = dietry_fibre[ageSet];
                obj[i].female.vitamin_a = vitamin_a[ageSet];
                obj[i].female.vitamin_b_12 = vitamin_b_12[ageSet];
                obj[i].female.folate = folate[ageSet];
                obj[i].female.vitamin_d = vitamin_d[ageSet];
                obj[i].female.thiamin = thiamin[ageSet];
                obj[i].female.riboflavin = riboflavin[ageSet];
                obj[i].female.niacin_equivalent = niacin_equivalent[ageSet];
                obj[i].female.vitamin_b_6 = vitamin_b_6[ageSet];
                obj[i].female.vitamin_c = vitamin_c[ageSet];
                obj[i].female.iron = iron[ageSet];
                obj[i].female.calcium = calcium[ageSet];
                obj[i].female.magnesium = magnesium[ageSet];
                obj[i].female.potassium = potassium[ageSet];
                obj[i].female.zinc = zinc[ageSet];
                obj[i].female.copper = copper[ageSet];
                obj[i].female.phosphorus = phosphorus[ageSet];
                obj[i].female.chloride = chloride[ageSet];
                obj[i].female.iodine = iodine[ageSet];
                obj[i].female.selenium = selenium[ageSet];
                obj[i].female.sodium = sodium[ageSet];

                if (i !== 4 && i !== 19) {
                    ++ageSet;
                }
                console.log('age: ', i);
                console.log('age set: ', ageSet);
        }

        try {
            const result = await APIRequest.httpRequest({
            method: 'POST',
            body: obj,
            endpoint: 'api/userrecords/' 
            ,isAuthRequired: true
            });
        
        } catch (error) {
        console.log('userrecord', error)
        }
    }
};