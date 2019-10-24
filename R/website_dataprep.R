library(dplyr)

setwd("/Users/arjunkakkar/Desktop/Diversity\ Website/R")

merged_data <- read.csv('compiled_2017.csv') %>%
  full_join(
    read.csv('compiled_2018.csv'),
    by = c('Entry', 'Name', 'predrace', 'Year', 'firstname', 'surname'),
    suffix = c('_2017', '_2018')
  )

levels(merged_data$Room_2017) <-
  c(
    "Agard",
    "Mission",
    "Brooks",
    "Bryant",
    "Carter",
    "Chadbourne",
    "Currier",
    "Dodd",
    "Doughty",
    "East",
    "Fayerweather",
    "Fitch",
    "Garfield",
    "Gladden",
    "Goodrich",
    "Horn",
    "Hubbell",
    "Lambert",
    "Lehman",
    "Mark Hopkins",
    "Milham",
    "Mission",
    "Morgan",
    "Parsons",
    "Perry",
    "Poker Flats",
    "Prospect",
    "Sage",
    "Sewall",
    "Spencer",
    "Susan Hopkins",
    "Thompson",
    "Tyler",
    "Tyler Annex",
    "West",
    "Williams",
    "Wood",
    "Woodbridge"
  )


# Separate Tyler and Tyler Annex, and AP and MD
building_ids <- data.frame(
  name = levels(merged_data$Room_2017),
  id = c(
    214111686,
    214110776,
    214111379,
    214111531,
    214111537,
    214111430,
    214110454,
    214110450,
    214111268,
    214110540,
    214110555,
    214110473,
    214111754,
    214111432,
    214110526,
    214111485,
    214110490,
    214111373,
    214110694,
    214111593,
    214111395,
    214110800,
    214110533,
    214111577,
    214110525,
    214110511,
    214111011,
    214110510,
    214111362,
    214111342,
    214110722,
    214111107,
    214111107,
    214111042,
    214110967,
    214111672,
    214111228
  )
)

############## Building and College Proportions ###########################
collegeprop <- merged_data %>%
  mutate(predrace = ifelse(predrace == "East_Indian", "Asian", as.character(predrace))) %>%
  group_by(predrace) %>%
  summarize(prop = n() / nrow(merged_data))

prop_data <- merged_data %>%
  filter(!is.na(Room_2017)) %>%
  group_by(Room_2017) %>%
  summarize(
    p_whi = sum(predrace == "White_Caucasian") / n(),
    p_bla = sum(predrace == "Black_African_descent") / n(),
    p_asi = sum(predrace == "Asian") / n(),
    p_lat = sum(predrace == "Latino_Hispanic") / n(),
    p_eas = sum(predrace == "East_Indian") / n(),
    total_num = n()
  ) %>%
  left_join(building_ids, by = c('Room_2017' = 'name')) %>%
  mutate(p_asi = p_asi + p_eas) %>%
  select(-p_eas)


pvals <-
  apply(prop_data, 1, function(row)
    chisq.test(
      as.numeric(row['total_num']) * as.numeric(c(row['p_asi'], row['p_bla'], row['p_lat'], row['p_whi'])),
      p = collegeprop$prop,
      rescale.p = TRUE
    )$p.value)

prop_data <- mutate(prop_data, pval = pvals)

write.csv(prop_data, file = 'prop_data.csv')


###################### Movement after first year ######################
merged_data %>%
  filter(Year == 2021) %>%
  filter(!is.na(Room_2017) & !is.na(Room_2018)) %>%
  group_by(Room_2017) %>%
  mutate(building_pop = n()) %>%
  ungroup() %>%
  group_by(Room_2017, Room_2018) %>%
  summarize(num = n()/unique(building_pop)) %>%
  left_join(building_ids, by = c('Room_2017' = 'name')) %>%
  rename(id_2017 = id) %>%
  left_join(building_ids, by = c('Room_2018' = 'name')) %>%
  rename(id_2018 = id) %>%
  group_by(Room_2017) %>%
  arrange(num, .by_group = TRUE) %>%
  mutate(index = row_number())
  write.csv(., file = 'movement_data.csv')

