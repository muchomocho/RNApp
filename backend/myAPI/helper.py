import decimal
import datetime


def unit_converter(target_unit, from_unit):
    if target_unit.lower() == from_unit.lower():
        return 1

    def _unit_multiplier(unit):
        if unit == 'g':
            return 1
        if unit == 'mg':
            return decimal.Decimal(1000)
        if unit == 'microg':
            return decimal.Decimal(1e+6)
        else:
            return False

    return _unit_multiplier(target_unit) / _unit_multiplier(from_unit)


def genderMap(genderChar):
    if genderChar == 'M':
        return "male"

    if genderChar == 'F':
        return "female"

    return "other"


def age_map(age):
    if age <= 0:
        return 1
    if age == 3:
        return 2
    if age == 6:
        return 5
    if age > 7 and age < 11:
        return 7
    if age > 11 and age < 15:
        return 11
    if age > 15 and age < 19:
        return 15
    if age > 19 and age < 50:
        return 19
    if age > 50 and age < 65:
        return 50
    if age > 65 and age < 75:
        return 65
    if age >= 75:
        return 75
    return age


def get_age_from_dob(dob_date):
    date_now = datetime.datetime.now()
    age = date_now.year - dob_date.year

    if dob_date.month < date_now.month and dob_date.day < date_now.day:
        age -= 1
    return age
