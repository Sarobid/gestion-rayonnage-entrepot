from math import dist
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from collections import defaultdict
import string

def filter_data(liste):
    data = defaultdict(list)
    for item in liste:
        data[item['num_depot']].append({
            "num_emplacement"       : item['couloir__rack__emplacement__num_emplacement'],
            "couloir"               : item['couloir__nom_couloir'],
            "num_rack_dans_couloir" : item['couloir__rack__num_rack_dans_couloir'],
            "rangee"                : item['couloir__rack__emplacement__num_rangee'],
            "largeur_case"          : item['couloir__rack__largeur_case'],
            "quantite"              : item['couloir__rack__emplacement__quantite'],
            "date"                  : item['couloir__rack__emplacement__sku__date_arrivage']
        })

    fitered_data = [{"depot": depot, "emplacements": emplacements} for depot, emplacements in data.items()]

    return fitered_data

def calculateCoordinates(couloir_idx,rangee_idx,largeur_case,longueur_rack_prec):
    x = couloir_idx
    y = (rangee_idx * largeur_case) + longueur_rack_prec
    return x,y

def calculateDistance(origin, point_B):
    return round(dist(origin,point_B),1)

def create_data(liste):
    data = {}
    data['nb_magasinier']  = 1
    data['destination'] = 0
    data['distance_matrix'] = []
    alphabet = list(string.ascii_uppercase)

    i = 0
    while i < len(liste):
        liste_distance = []
        origin = liste[i]
        origin_coordinates = calculateCoordinates(
            couloir_idx  = alphabet.index(origin['couloir']),
            rangee_idx   = alphabet.index(origin['rangee']),
            largeur_case = origin['largeur_case'],
            longueur_rack_prec = origin['longueur_rack_prec']
        )

        for elmt in liste:
            point_b = calculateCoordinates(
            couloir_idx  = alphabet.index(elmt['couloir']),
            rangee_idx   = alphabet.index(elmt['rangee']),
            largeur_case = elmt['largeur_case'],
            longueur_rack_prec = elmt['longueur_rack_prec']
            )
            liste_distance.append(calculateDistance(origin_coordinates,point_b))

        data['distance_matrix'].append(liste_distance)

        i = i + 1
    return data


def get_routes(solution,routing,manager):
    routes = []
    for num_route in range(routing.vehicles()):
        index = routing.Start(num_route)
        route = [manager.IndexToNode(index)]
        while not routing.IsEnd(index):
            index = solution.Value(routing.NextVar(index))
            route.append(manager.IndexToNode(index))
        routes.append(route)
    return routes

def print_routes(manager,routing, solution):
    print(f"Trajet total: {solution.ObjectiveValue()} m")
    index = routing.Start(0)
    plan_output = "Route du magasinier 0:\n"
    route_distance = 0
    while not routing.IsEnd(index):
        plan_output += f" Couloir {manager.IndexToNode(index)} ->"
        previous_index = index
        index = solution.Value(routing.NextVar(index))
        route_distance += routing.GetArcCostForVehicle(previous_index, index, 0)
    plan_output += f" {manager.IndexToNode(index)}\n"
    print(plan_output)
    plan_output += f"Route distance: {route_distance}miles\n"


def get_shortest_path(liste):
    data = create_data(liste)
    manager = pywrapcp.RoutingIndexManager(
        len(data["distance_matrix"]), data["nb_magasinier"], data["destination"]
    )

    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(index_start, index_destination):
        start_node = manager.IndexToNode(index_start)
        destination_node = manager.IndexToNode(index_destination)
        return  data["distance_matrix"][start_node][destination_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        print_routes(manager, routing, solution)

    routes = get_routes(solution,routing,manager)

    return routes

def arrange_result_and_data(result,liste_emplacement):
    i = 0
    arranged_result = []

    for depot in liste_emplacement:
        liste_par_depot= {}

        liste_par_depot['depot'] = depot['depot']
        liste_par_depot['emplacements'] = []

        j=0
        for indexe in result[i][0]:
            article_emplacement = {}
            article_emplacement = depot['emplacements'][indexe]
            liste_par_depot['emplacements'].append(article_emplacement)

            j = j + 1
            if j == (len(result[i][0]) - 1):
                break

        arranged_result.append(liste_par_depot)
        i = i + 1

    return arranged_result

