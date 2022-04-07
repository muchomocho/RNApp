
export const LOCAL_HOST = 'http://127.0.0.1:8000/';

export const LOCAL_NETWORK = 'http://192.168.0.32:8081/';

export const ROOT_URL = LOCAL_NETWORK

export var username = ''

export const BIG_MONTH = [1, 3, 5, 7, 8, 10, 12]

export const SMALL_MONTH = [4, 6, 9, 11]

const energy = [765, 717, 1088, 1004, 1482, 1378, 1817, 1703, 2500, 2000, 2500, 2000, 2500, 2000, 2342, 1912, 2294, 1840]
const protein = [14.5, 14.5, 14.5, 14.5, 19.7, 19.7, 28.3, 28.3, 42.1, 41.2, 55.2, 45.0, 55.5, 45.0, 53.3, 46.5, 53.3, 46.5]
const fat = [0, 0, 0, 0, 58, 54, 71, 66, 97, 78, 97, 78, 97, 78, 91, 74, 89, 72]
const saturated_fat = [0, 0, 0, 0, 18, 17, 22, 21, 31, 24, 31, 24, 31, 24, 29, 23, 28, 23]
const polyunsaturated_fat = [0, 0, 0, 0, 11, 10, 13, 12, 18, 14, 18, 14, 18, 14, 17, 14, 17, 13]
const monounsaturated_fat = [0, 0, 0, 0, 21, 20, 26, 25, 36, 29, 36, 29, 36, 29, 34, 28, 33, 27]
const carbohydrate = [0, 0, 145, 134, 198, 184, 242, 227, 333, 267, 333, 267, 333, 267, 312, 255, 306, 245]
const free_sugars = [0, 0, 15, 13, 20, 18, 24, 23, 33, 27, 33, 27, 33, 27, 31, 26, 31, 25]
const salt = [2.0, 2.0, 2.0, 2.0, 3.0, 3.0, 5.0, 5.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0]
const dietry_fibre = [0, 0, 15, 15, 15, 15, 20, 20, 25, 25, 30, 30, 30, 30, 30, 30, 30, 30]
const vitamin_a = [400, 400, 400, 400, 400, 400, 500, 500, 600, 600, 700, 600, 700, 600, 700, 600, 700, 600]
const vitamin_b_12 = [0.5, 0.5, 0.5, 0.5, 0.8, 0.8, 1.0, 1.0, 1.2, 1.2, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5]
const folate = [70, 70, 70, 70, 100, 100, 150, 150, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200]
const vitamin_d = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
const thiamin = [0.3, 0.3, 0.4, 0.4, 0.6, 0.6, 0.7, 0.7, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 0.9, 0.8, 0.9, 0.7]
const riboflavin = [0.6, 0.6, 0.6, 0.6, 0.8, 0.8, 1.0, 1.0, 1.2, 1.1, 1.3, 1.1, 1.3, 1.1, 1.3, 1.1, 1.3, 1.1]
const niacin_equivalent = [5.0, 4.7, 7.2, 6.6, 9.8, 9.1, 12.0, 11.2, 16.5, 13.2, 16.5, 13.2, 16.5, 13.2, 15.5, 12.6, 15.1, 12.1]
const vitamin_b_6 = [0.7, 0.7, 0.7, 0.7, 0.9, 0.9, 1.0, 1.0, 1.2, 1.0, 1.5, 1.2, 1.4, 1.2, 1.4, 1.2, 1.4, 1.2]
const vitamin_c = [30, 30, 30, 30, 30, 30, 30, 30, 35, 35, 40, 40, 40, 40, 40, 40, 40, 40]
const iron = [6.9, 6.9, 6.9, 6.9, 6.1, 6.1, 8.7, 8.7, 11.3, 14.8, 11.3, 14.8, 8.7, 8.7, 8.7, 8.7, 8.7, 8.7]
const calcium = [350, 350, 350, 350, 450, 450, 550, 550, 1000, 800, 1000, 800, 700, 700, 700, 700, 700, 700]
const magnesium = [85, 85, 85, 85, 120, 120, 200, 200, 280, 280, 300, 300, 300, 270, 300, 270, 300, 270]
const potassium = [800, 800, 800, 800, 1100, 1100, 2000, 2000, 3100, 3100, 3500, 3500, 3500, 3500, 3500, 3500, 3500, 3500]
const zinc = [5.0, 5.0, 5.0, 5.0, 6.5, 6.5, 7.0, 7.0, 9.0, 9.0, 9.5, 7.0, 9.5, 7.0, 9.5, 7.0, 9.5, 7.0]
const copper = [0.4, 0.4, 0.4, 0.4, 0.6, 0.6, 0.7, 0.7, 0.8, 0.8, 1.0, 1.0, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2]
const phosphorus = [270, 270, 270, 270, 350, 350, 450, 450, 775, 625, 775, 625, 550, 550, 550, 550, 550, 550]
const chloride = [800, 800, 800, 800, 1100, 1100, 1800, 1800, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500]
const iodine = [70, 70, 70, 70, 100, 100, 110, 110, 130, 130, 140, 140, 140, 140, 140, 140, 140, 140]
const selenium = [15, 15, 15, 15, 20, 20, 30, 30, 45, 45, 70, 60, 75, 60, 75, 60, 75, 60]
const sodium = [0.8, 0.8, 0.8, 0.8, 1.2, 1.2, 2.0, 2.0, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4]

export const dietDataContainer = () => {
    var obj = {
        "energy": {},
        "protein": {},
        "fat": {},
        "saturated_fat": {},
        "polyunsaturated_fat": {},
        "monounsaturated_fat": {},
        "carbohydrate": {},
        "free_sugars": {},
        "salt": {},
        "dietry_fibre": {},
        
        "vitamin_a": {},
        "vitamin_b12": {},
        "folate": {},
        "vitamin_d": {},
        
        "thiamin": {},
        "riboflavin": {},
        "niacin_equivalent": {},
        "vitamin_b6": {},
        "vitamin_c": {},

        "iron": {},
        "calcium": {},
        "magnesium": {},
        "potassium": {},
        "zinc": {},
        "copper": {},
        "phosphorus": {},
        "chloride": {},

        "iodine": {},
        "selenium": {},

        "sodium": {},
    }

    obj.energy.unit = 'kcal';

    obj.protein.unit = 
    obj.fat.unit =
    obj.saturated_fat.unit =
    obj.polyunsaturated_fat.unit =
    obj.monounsaturated_fat.unit =
    obj.carbohydrate.unit =
    obj.free_sugars.unit =
    obj.salt.unit =
    obj.dietry_fibre.unit = 
    obj.sodium.unit = 'g'

    obj.vitamin_a.unit =
    obj.vitamin_b12.unit =
    obj.folate.unit =
    obj.vitamin_d.unit = 
    obj.iodine.unit =
    obj.selenium.unit = 'microg'

    obj.thiamin.unit =
    obj.riboflavin.unit =
    obj.niacin_equivalent.unit =
    obj.vitamin_b6.unit =
    obj.vitamin_c.unit = 
    obj.iron.unit =
    obj.calcium.unit =
    obj.magnesium.unit =
    obj.potassium.unit =
    obj.zinc.unit =
    obj.copper.unit =
    obj.phosphorus.unit =
    obj.chloride.unit = 'mg'
    
    return obj;
};