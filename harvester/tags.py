CATEGORY_ORDER = [
    "winery",
    "vineyard",
    "wine_cellar",
    "wine_shop",
    "wine_bar",
    "other",
]


def categorize(tags):
    craft = tags.get("craft")
    if craft == "winery":
        return "winery"
    industrial = tags.get("industrial")
    if industrial == "winery":
        return "winery"
    building = tags.get("building")
    if building == "winery":
        return "winery"
    if tags.get("landuse") == "vineyard":
        return "vineyard"
    # `crop=grape` is the alternative tagging style (often paired with
    # landuse=farmland or landuse=orchard) used outside the
    # landuse=vineyard convention. Treat it as the same category.
    if tags.get("crop") == "grape":
        return "vineyard"
    if tags.get("tourism") == "wine_cellar" or tags.get("man_made") == "wine_cellar":
        return "wine_cellar"
    amenity = tags.get("amenity")
    if amenity == "wine_bar":
        return "wine_bar"
    if amenity == "bar" and tags.get("cuisine") == "wine":
        return "wine_bar"
    shop = tags.get("shop")
    if shop == "wine":
        return "wine_shop"
    if tags.get("cuisine") == "wine":
        return "wine_bar"
    return "other"
