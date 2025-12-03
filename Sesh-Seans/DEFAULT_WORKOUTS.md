# Default Workouts Sheet

Copy and paste this into your Google Sheets "Workouts" tab if you want to manually create it or modify the defaults.

## Format
```
Workout Name | Exercise | Weight | Reps | Time (seconds)
```

## Default 3-Day Split + Extras

```
Workout Name	Exercise	Weight	Reps	Time (seconds)
# Add # at start of workout name to hide it from dropdown				
					
# === DAY 1: LEGS + ARMS ===				
Day 1: Legs + Arms	Squats	0	30	0
Day 1: Legs + Arms	Lunges	0	20	0
Day 1: Legs + Arms	Bulgarian Split Squats	0	15	0
Day 1: Legs + Arms	Glute Bridges	0	25	0
Day 1: Legs + Arms	Calf Raises	0	30	0
Day 1: Legs + Arms	Wall Sit	0	0	60
Day 1: Legs + Arms	Quad Isometric Flex	0	0	30
Day 1: Legs + Arms	Dumbbell Curl	20	12	0
Day 1: Legs + Arms	Hammer Curl	20	12	0
Day 1: Legs + Arms	Tricep Extension	20	15	0
Day 1: Legs + Arms	Bicep Isometric Flex	0	0	30
Day 1: Legs + Arms	Tricep Isometric Flex	0	0	30
					
# === DAY 2: BACK + PULL ===				
Day 2: Back + Pull	Dead Hang	0	0	30
Day 2: Back + Pull	Pullups	0	10	0
Day 2: Back + Pull	Chin-ups	0	10	0
Day 2: Back + Pull	Negative Pullups	0	5	0
Day 2: Back + Pull	Hanging Knee Raises	0	15	0
Day 2: Back + Pull	Bent Over Row	25	12	0
Day 2: Back + Pull	Single Arm Row	25	12	0
Day 2: Back + Pull	Dumbbell Shrug	30	15	0
Day 2: Back + Pull	Back Isometric Flex	0	0	30
Day 2: Back + Pull	Seated Shoulder Blade Squeeze	0	0	30
					
# === DAY 3: CHEST + CORE ===				
Day 3: Chest + Core	Push-ups	0	20	0
Day 3: Chest + Core	Wide Push-ups	0	15	0
Day 3: Chest + Core	Diamond Push-ups	0	15	0
Day 3: Chest + Core	Pike Push-ups	0	12	0
Day 3: Chest + Core	Chest Press (Floor)	25	15	0
Day 3: Chest + Core	Chest Fly (Floor)	20	15	0
Day 3: Chest + Core	Chest Isometric Flex	0	0	30
Day 3: Chest + Core	Plank	0	0	60
Day 3: Chest + Core	Side Plank (Left)	0	0	30
Day 3: Chest + Core	Side Plank (Right)	0	0	30
Day 3: Chest + Core	Stomach Vacuum	0	0	30
Day 3: Chest + Core	Hollow Body Hold	0	0	30
Day 3: Chest + Core	Bicycle Crunches	0	30	0
Day 3: Chest + Core	Russian Twists	0	30	0
Day 3: Chest + Core	Ab Isometric Flex	0	0	30
					
# === FULL BODY QUICK ===				
Full Body Quick	Burpees	0	15	0
Full Body Quick	Jump Squats	0	20	0
Full Body Quick	Push-ups	0	20	0
Full Body Quick	Mountain Climbers	0	30	0
Full Body Quick	Plank	0	0	60
Full Body Quick	Pullups	0	10	0
					
# === STRETCHING ROUTINE ===				
Stretching Routine	Seated Neck Stretch (Side)	0	0	30
Stretching Routine	Seated Shoulder Stretch	0	0	30
Stretching Routine	Seated Tricep Stretch	0	0	30
Stretching Routine	Seated Spinal Twist	0	0	30
Stretching Routine	Seated Forward Fold	0	0	30
Stretching Routine	Seated Figure-4 Stretch	0	0	30
Stretching Routine	Seated Hamstring Stretch	0	0	30
Stretching Routine	Seated Calf Stretch	0	0	30
```

## How to Use

1. The app will automatically create this sheet with these defaults
2. You can edit the sheet directly in Google Sheets
3. Add `#` at the start of a workout name to hide it from the dropdown
4. Use `# === CATEGORY ===` format for section headers (these are ignored)
5. Each row represents one exercise in a workout routine
6. When you select a workout and enable "Workout Mode", it will cycle through all exercises with that workout name

## Creating Custom Workouts

Just add rows with the same "Workout Name" to group exercises together:

```
My Custom Workout	Exercise 1	10	12	0
My Custom Workout	Exercise 2	0	0	30
My Custom Workout	Exercise 3	20	10	0
```

When you log an exercise in Workout Mode, it automatically moves to the next exercise in the sequence!
