import string
from collections import defaultdict
from django.contrib.admin.templatetags.admin_list import results
from django.db.models.expressions import result


def set_next_letter(letter):
    alphabet = list(string.ascii_uppercase)
    if letter in alphabet:
        index = alphabet.index(letter)
        return alphabet[index + 1] if index + 1 < len(alphabet) else None

    return None


def calculate_waste_approximity(quantite,articlePoids,articleVolume,cases):
    results = []
    for case in cases:
        quantite_possible_poids = int(case['couloir__rack__charge_max_case'] / articlePoids)
        quantite_possible_volume = int(case['couloir__rack__volume_case'] / articleVolume)

        if ((quantite_possible_volume != 0) and (quantite_possible_poids != 0)):
            if (quantite_possible_poids < quantite_possible_volume):
                quantite_possible = quantite_possible_poids

            if (quantite_possible_poids > quantite_possible_volume):
                quantite_possible = quantite_possible_volume

            if ((quantite < quantite_possible) and (quantite > 0)):
                quantite_possible = quantite

            moyenne_article = ((quantite_possible * articlePoids + quantite_possible * articleVolume) / 2)
            moyenne_case = ((case['couloir__rack__charge_max_case'] + case['couloir__rack__volume_case']) / 2)
            pourcentage_gaspillage = (((moyenne_case - moyenne_article) * 100) / moyenne_case)

            num_depot = case['num_depot']
            nom_couloir = case['couloir__nom_couloir']
            charge_max_case = case['couloir__rack__charge_max_case']
            volume_case = case['couloir__rack__volume_case']
            num_emplacement = case['couloir__rack__emplacement__num_emplacement']

        result = {}
        result['num_depot'] = num_depot
        result['nom_couloir'] = nom_couloir
        result['num_emplacement'] = num_emplacement
        result['quantite'] = quantite_possible
        result['gaspillage'] = pourcentage_gaspillage
        results.append(result)
        sorted_result = sorted(results, key=lambda x: x['gaspillage'])

    return sorted_result

def sort_array_by_priority(array_param,array2):
    if len(array_param) == 0:
        return []

    middle = None
    sorted_array = []
    result= []

    if len(array_param) % 2 == 0:
        second_index_start =  int(len(array_param) / 2)
        first_half = array_param[:second_index_start]
        second_half = array_param[second_index_start:len(array_param)]

    else:
        middle_index = int(len(array_param)/2)
        second_index_start = int((len(array_param) / 2) + 1)

        middle = array_param[middle_index]
        first_half = array_param[:middle_index]
        second_half = array_param[second_index_start:len(array_param)]

    if middle != None:
        sorted_array.append(middle)

    for i in range(int(len(array_param)/2)):
        sorted_array.append(first_half[::-1][i])
        sorted_array.append(second_half[i])

    for data in sorted_array:
        sorted_data = list(filter(lambda d: d['couloir__num_couloir'] == data,array2))

        result.append(sorted(sorted_data, key=lambda x: x['couloir__rack__num_rack_dans_couloir']))

    return result, sorted_array

def sort_emplacements(liste_rack,liste_article):
    alphabet = list(string.ascii_uppercase)
    emplacements = []

    for groupe in liste_rack:
        for rack in groupe:
            should_break = False
            nb_rangee = rack["couloir__rack__nb_rangee"]
            nb_niveau = rack["couloir__rack__nb_niveau"]
            emplacement = {}
            emplacement["nom_couloir"] = rack["couloir__nom_couloir"]
            emplacement["num_rack_dans_couloir"] = rack["couloir__rack__num_rack_dans_couloir"]
            emplacement["nb_niveau_rack"] = nb_niveau
            emplacement["nb_rangee_rack"] = nb_rangee
            emplacement["racks"] = []



            for i in range(nb_niveau):
                niveau = i
                for j in range(nb_rangee):
                    if len(liste_article) == 0:
                        should_break = True
                        break
                    information = {}

                    rangee = alphabet[j]
                    information["niveau"]           = niveau
                    information["rangee"]           = rangee
                    information["ref_interne"]      = liste_article[0]['ref_interne']
                    information["designation"] = liste_article[0]['designation']

                    emplacement["racks"].append(information)
                    liste_article.pop(0)

                if should_break:
                    break
            emplacements.append(emplacement)
            if should_break:
                break

    return group_data(emplacements)

def group_data(data):
    grouped_data = defaultdict(list)
    for item in data:
        grouped_data[item["nom_couloir"]].append(item)

# Transform into desired format
    result = [{"nom_couloir": key, "result": value} for key, value in grouped_data.items()]

    return result

[{"num_D":1,
  "columns":[
      {"num_col":1,
       "rows":[ {"num_rows": 41,
                "emplacement" : [
                                   {"num_element":"KL",
                                    "rangee": 1,
                                    "niveau": 5
                                    }, {"num_element":"KL",
                                        "rangee": 1,
                                        "niveau": 5
                                        }
                                ]
                 }
                ],
       }
  ]
  }]












