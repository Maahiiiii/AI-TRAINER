from exercise_configs import EXERCISE_CONFIGS
import inspect

print("=" * 60)
print("COMPREHENSIVE BACKEND VALIDATION TEST")
print("=" * 60)

# Test 1: Critical Exercise IDs
print("\n📋 Test 1: Critical Exercise IDs")
print("-" * 60)
critical_ids = ['shoulder-press', 'push-ups', 'squats', 'bicep-curls', 
                'calf-raises', 'jumping-jacks', 'burpees', 'plank']
for ex_id in critical_ids:
    status = "✅ OK" if ex_id in EXERCISE_CONFIGS else "❌ MISSING"
    print(f"  {ex_id:25} {status}")

# Test 2: Stage Differentiation
print("\n🎯 Test 2: Stage Range Validation")
print("-" * 60)
broken = []
for ex_id, config in EXERCISE_CONFIGS.items():
    stages = config.get('stages', [])
    if len(stages) >= 2:
        if stages[0]['ranges'] == stages[1]['ranges']:
            broken.append(ex_id)

if broken:
    for ex in broken:
        print(f"  ❌ {ex}: Identical stage ranges")
else:
    print("  ✅ All multi-stage exercises have unique ranges")

# Test 3: Exercise Statistics
print("\n📊 Test 3: Exercise Statistics")
print("-" * 60)
total = len(EXERCISE_CONFIGS)
multi_stage = sum(1 for c in EXERCISE_CONFIGS.values() if len(c.get('stages', [])) >= 2)
single_stage = sum(1 for c in EXERCISE_CONFIGS.values() if len(c.get('stages', [])) == 1)
time_based = sum(1 for c in EXERCISE_CONFIGS.values() if c.get('tracking_type') == 'time_based')

print(f"  Total exercises:          {total}")
print(f"  Multi-stage (rep-counted):{multi_stage:3}")
print(f"  Single-stage (holds):     {single_stage:3}")
print(f"  Time-based:               {time_based:3}")

# Test 4: Form Validation Coverage
print("\n✅ Test 4: Form Validation Coverage")
print("-" * 60)

import form_validator
source = inspect.getsource(form_validator.validate_form)

# Extract exercise IDs that have validation
validated_exercises = set()
for line in source.split('\n'):
    if "exercise_id ==" in line or "exercise_id in" in line:
        # Extract exercise IDs from the line
        if "'" in line:
            parts = line.split("'")
            for i in range(1, len(parts), 2):
                ex_id = parts[i]
                if ex_id in EXERCISE_CONFIGS:
                    validated_exercises.add(ex_id)

coverage_pct = (len(validated_exercises) / total) * 100
print(f"  Exercises with validation: {len(validated_exercises)}/{total}")
print(f"  Coverage:                  {coverage_pct:.1f}%")
print(f"\n  Validated exercises:")
for ex in sorted(validated_exercises):
    print(f"    • {ex}")

# Test 5: Missing Validation
print("\n⚠️  Exercises WITHOUT Form Validation:")
print("-" * 60)
missing_validation = set(EXERCISE_CONFIGS.keys()) - validated_exercises
if missing_validation:
    print(f"  Count: {len(missing_validation)}")
    for ex in sorted(missing_validation):
        print(f"    • {ex}")
else:
    print("  ✅ All exercises have form validation!")

# Test 6: Angle Range Analysis
print("\n🔍 Test 6: Detection Quality Analysis")
print("-" * 60)

narrow_ranges = []
for ex_id, config in EXERCISE_CONFIGS.items():
    stages = config.get('stages', [])
    if len(stages) >= 2:
        for stage in stages:
            for joint, (min_angle, max_angle) in stage['ranges'].items():
                range_width = max_angle - min_angle
                if range_width < 25:  # Flag narrow ranges
                    narrow_ranges.append(f"{ex_id} ({joint}: {range_width}°)")

if narrow_ranges:
    print(f"  ⚠️  Exercises with narrow angle ranges (< 25°):")
    for item in narrow_ranges[:10]:  # Show first 10
        print(f"    • {item}")
    if len(narrow_ranges) > 10:
        print(f"    ... and {len(narrow_ranges) - 10} more")
else:
    print("  ✅ All angle ranges are sufficiently wide")

# Final Summary
print("\n" + "=" * 60)
print("FINAL SUMMARY")
print("=" * 60)

issues = []
if broken:
    issues.append(f"❌ {len(broken)} exercise(s) with identical stages")
if coverage_pct < 50:
    issues.append(f"⚠️  Low form validation coverage ({coverage_pct:.1f}%)")

if not issues:
    print("✅ ALL TESTS PASSED!")
    print("✅ Backend is ready for deployment")
else:
    print("Issues found:")
    for issue in issues:
        print(f"  {issue}")

print("\n" + "=" * 60)
