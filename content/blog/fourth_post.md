+++
date = '2025-02-04'
title = 'Diet update and Blogging'
+++

## Blogging

I made a commitment to update this site once a day, as part of a continous learning objective, and I figure an easy update is blogging, just a place I can track things I learned the previous day, my diet progress, and anything else I might find interesting.

## Gaming News

So, one thing I want to highlight as something I will keep using daily, is my expierence in Team Fight Tactics, I prefer this to league of legends now a days because I can theoretically work on other things while playing

Now, what am I bringing it up? I want to track some more progress, so currently I am Plat 4, 73 LP and I peaked around Plat 3 30 lp. I jump between plat 4 0 lp and that peak without making much progress, so maybe this is a good place to leave some notes?

some things I like to play are irelia and trundle hero augment whenever i get a chance, followed by enforcer/family emblem if 2-1, and otherwise I go 6 watcher 2 sniper zeri carry with flex options for ekko on 9

I dont currently focus on streaking, I focus gold augments, and I always play the best board without purchasing units, i think there's some room to optimize (esp when im sitting with 2 sniper, 5 watcher, i often lose there I think). 

Considering writing a program to track this, and chess more. Additionally, I wanna try 6 scrap comp as I lose to it often, but not sure how to do it, I'll come back and update this at some point.

## Diet

In my dieting world, let me preface by saying I started heavily dieting at start of December, I weighted 267 pounds, and am just under 6 foot (call me 6 ft, if you ever call me 5'11 I will crashout), in retrosepect I should have started tracking this more carefully sooner, but never too late to start doing something right! iirc by new year I lost about 7 pounds sitting mostly at 260, and by end of January I was pretty much 256, it was definitly a rough month going between 260 and 256 a lot, I started Huel (props to my friend max for introducing me and hitting me up with that discount code for referals). This morning I weighted 252, so good progress 4 days into this month, hoping to keep it up, my goal is to drop below 200, hopefully by summer so 50 pounds in 4 months is hard lol, 12.5 pounds per month sounds a little easier, but as long as i even slighly improve my progress and say 8 pounds in 4 months, 32 pounds and getting to 224 is huge, i dont even remember the last time i weight that much.

| Month    | Weight (ending) |
| -------- | ------- |
| December  | 260    |
| January | 256     |
| Febuary (In Progress)    | 252    |
| March (Hopeful)    | 239    |


## Learning Objectives

What did I learn yesterday? I should start updating this throughout the day like a diary, it's hard to recall exactly, but the primary things were

1. Structuring a repo
2. Containers

Let's go over structuring a repo! Some of my biggest issues in being a full developer are I don't really know how to program to standards! This is an ongoing challenge of mine, and the best solution I have found to address it are to read read read, I advocate for this in my library but the biggest goal I have is reading more code from people that know what they're doing! In response, a lot of my newer projects are following more and more standards, 2 months ago I didn't include .gitignore in a repo and to work on code across different computers I would email myself the code! No concept of git, github, or anything of the sort.

Anyways, I'll outline my current coinbase-tracker, it's in a private repo, but it's structured as

.github/
    .pre-commit-config.yaml
    .dependency-update.yaml
config/
    logging.conf
    settings.yaml
src/
    exchange.py
    main.py
.gitignore
README.md
requirements.txt


Pretty simple, and more than likely will be adding things to src and config, my next course of action is having it generate a template for an example env, im sure there's an approach I can use (i've seen example env templates in a lot of code), I just need to find it now that im looking for it.

Containers are also a fun conversation, I more or less have known they exist for over a year, but didnt really understand what they were or how they worked, I actually once on an interview mistook a generic docker program for their proprietary containers they made, needless to say that showed my complete inexpierence working with them.

I still don't really have a strong understand of the workflows they open up, but i do know i should use it for my coinbase tracker, for context the plan is to deploy it 24/7 on some webhosting service with low latency, my understanding is if i containerize my program it should enable me to package everything up nice and cleanly.

## Note to include "Modern" events

I wanted to include this for my next blog, talk about something more interesting, modern events/political :) 