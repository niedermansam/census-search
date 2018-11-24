# ACS Searcher

A javascript application to visualize data from the American Community Survey. Currently, the application loads data from the [US Census Bureau's American Community Survey API](https://www.census.gov/data/developers/data-sets/acs-1year.html) (1 year estimates). Eventually, I plan to offer user the ability to make time series out of 5 year estimates, which will allow for data collection of areas with smaller population sizes.

## The Basics
- [x] Import variables
- [ ] Import variables with using API*
- [x] Deal with user input
- [x] Access census api
- [x] Deal with Promises
- [x] Tidy up Promise code
- [x] Filter by state
- [x] Filter by urban area
- [x] Connect state and urban area filters
- [x] Output data in table form
- [ ] Allow user to download data
- [x] Calculate percent change (output in table)

## Eventual Goals
- [ ] Include summary variable option
- [ ] Allow user to select summary variable*
- [ ] Create option for user to remove error bars
- [ ] Create option for user to draw continuous error bars
- [ ] Create modal with warnings/instructions
- [ ] Create detailed documentation
- [ ] Access information about variable comparability (show warning if variables not comparable)
- [ ] Allow user to switch between the ACS 5 year and 1 year estimates
- [ ] Allows user to filter by county when searching in 5 year estimates
- [ ] Allow user to filter geography with map*

\* maybe
