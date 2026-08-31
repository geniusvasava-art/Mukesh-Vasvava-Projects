import { MealAnalysisResult } from '../types';

export interface SampleMeal {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  calories: number;
  reductionPotential: number;
  result: MealAnalysisResult;
}

export const SAMPLE_MEALS: SampleMeal[] = [
  {
    id: 'pepperoni-pizza-plate',
    name: 'Pepperoni Pizza with Garlic Cream Dip',
    category: 'Dinner / Fast Casual',
    description: '2 large slices of thin-crust pepperoni pizza with garlic ranch dipping sauce and canned cola.',
    thumbnail: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
    calories: 890,
    reductionPotential: 420,
    result: {
      id: 'sample-1',
      timestamp: new Date().toISOString(),
      mealName: 'Pepperoni Pizza with Creamy Garlic Dip',
      overallDescription: 'High-calorie, carb and saturated fat dense meal consisting of cured meat, molten mozzarella cheese, and oil-heavy dipping sauce.',
      imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
      items: [
        {
          id: 'item-1',
          name: 'Pepperoni Pizza Slices',
          category: 'composite',
          estimatedWeightGrams: 240,
          originalWeightGrams: 240,
          servingDescription: '2 medium-large slices (approx. 120g each)',
          confidenceScore: 96,
          macros: {
            calories: 620,
            proteinGrams: 24,
            carbsGrams: 64,
            fatGrams: 30,
            fiberGrams: 3,
            sugarGrams: 6,
            saturatedFatGrams: 12,
            sodiumMg: 1420
          },
          per100g: {
            calories: 258,
            proteinGrams: 10,
            carbsGrams: 26.6,
            fatGrams: 12.5,
            fiberGrams: 1.25,
            sugarGrams: 2.5,
            saturatedFatGrams: 5,
            sodiumMg: 591
          },
          boundingBox: { top: 15, left: 12, width: 65, height: 60 },
          notes: 'Standard wheat dough with pepperoni slices and full-fat mozzarella.'
        },
        {
          id: 'item-2',
          name: 'Creamy Garlic Ranch Dip',
          category: 'sauce',
          estimatedWeightGrams: 45,
          originalWeightGrams: 45,
          servingDescription: '3 tablespoons dipping cup',
          confidenceScore: 92,
          macros: {
            calories: 210,
            proteinGrams: 1,
            carbsGrams: 3,
            fatGrams: 23,
            fiberGrams: 0,
            sugarGrams: 2,
            saturatedFatGrams: 4,
            sodiumMg: 380
          },
          per100g: {
            calories: 466,
            proteinGrams: 2.2,
            carbsGrams: 6.6,
            fatGrams: 51.1,
            fiberGrams: 0,
            sugarGrams: 4.4,
            saturatedFatGrams: 8.8,
            sodiumMg: 844
          },
          boundingBox: { top: 58, left: 65, width: 25, height: 25 },
          notes: 'Mayonnaise and buttermilk based sauce with high lipid concentration.'
        },
        {
          id: 'item-3',
          name: 'Regular Cola',
          category: 'beverage',
          estimatedWeightGrams: 250,
          originalWeightGrams: 250,
          servingDescription: '1 small cup (approx. 250ml)',
          confidenceScore: 94,
          macros: {
            calories: 105,
            proteinGrams: 0,
            carbsGrams: 27,
            fatGrams: 0,
            fiberGrams: 0,
            sugarGrams: 27,
            saturatedFatGrams: 0,
            sodiumMg: 25
          },
          per100g: {
            calories: 42,
            proteinGrams: 0,
            carbsGrams: 10.8,
            fatGrams: 0,
            fiberGrams: 0,
            sugarGrams: 10.8,
            saturatedFatGrams: 0,
            sodiumMg: 10
          },
          boundingBox: { top: 10, left: 70, width: 22, height: 35 },
          notes: 'Liquid high fructose corn syrup beverage.'
        }
      ],
      totalMacros: {
        calories: 935,
        proteinGrams: 25,
        carbsGrams: 94,
        fatGrams: 53,
        fiberGrams: 3,
        sugarGrams: 35,
        saturatedFatGrams: 16,
        sodiumMg: 1825
      },
      healthRating: {
        score: 3.5,
        nutriGrade: 'D',
        glycemicIndex: 'High',
        calorieDensity: 'High (3-5 kcal/g)',
        positives: ['Good source of calcium and protein from cheese', 'Satisfying flavor profile'],
        concerns: ['High saturated fat & sodium content', 'Empty liquid calories in sugary drink', 'Low dietary fiber']
      },
      reductionSuggestions: [
        {
          id: 'swap-1',
          title: 'Swap Garlic Ranch for Greek Yogurt Herb Dip',
          category: 'sauce_modifier',
          caloriesSaved: 165,
          fatSavedGrams: 20,
          proteinDifferenceGrams: 3,
          applied: false,
          explanation: 'Using 0% Greek yogurt with fresh garlic, dill, and lemon gives identical dipping pleasure with 80% fewer calories and bonus protein.',
          howToApply: 'Blend 45g Greek nonfat yogurt + minced garlic + herbs + lemon squeeze.',
          flavorImpact: 'Fresh & crisp twist',
          difficulty: 'Super Easy'
        },
        {
          id: 'swap-2',
          title: 'Switch Regular Cola to Sparkling Water with Lemon / Zero Sugar',
          category: 'ingredient_swap',
          caloriesSaved: 105,
          sugarSavedGrams: 27,
          carbsSavedGrams: 27,
          applied: false,
          explanation: 'Eliminates 27g of pure liquid sugar instantly without diminishing the meal satisfaction.',
          howToApply: 'Choose iced sparkling water with a fresh lemon wedge or Diet/Zero cola.',
          flavorImpact: 'Virtually identical',
          difficulty: 'Super Easy'
        },
        {
          id: 'swap-3',
          title: 'Dab Surface Oil & Swap 1 Slice for a Fresh Arugula Salad',
          category: 'portion_tweak',
          caloriesSaved: 180,
          fatSavedGrams: 9,
          fiberGrams: 2,
          applied: false,
          explanation: 'Replacing 1 slice with a peppery leafy green salad maintains high satiety and volume while halving pizza glycemic spike.',
          howToApply: 'Eat 1 slice pizza + 1 bowl arugula with balsamic drizzle.',
          flavorImpact: 'Fresh & crisp twist',
          difficulty: 'Quick Swap'
        }
      ],
      reducedPreset: {
        recipeTitle: 'Lightened Artisanal Pizza & Zesty Greek Dip',
        summary: 'Enjoy 1 crispy pizza slice alongside a generous Italian herb salad and high-protein Greek dip, saving over 450 calories.',
        totalCalories: 485,
        originalCalories: 935,
        calorieSavingsTotal: 450,
        percentageSaved: 48,
        macros: {
          calories: 485,
          proteinGrams: 26,
          carbsGrams: 52,
          fatGrams: 18,
          fiberGrams: 5
        },
        keyTechniques: [
          'Substituted dipping sauce for Nonfat Greek Yogurt garlic emulsion (-165 kcal)',
          'Substituted soda for zero-calorie citrus sparkling water (-105 kcal)',
          'Rebalanced 1 slice to high-volume leafy greens (-180 kcal)'
        ]
      },
      portionEstimateNotes: 'Portions estimated via visual reference with standard 10-inch plate sizing.'
    }
  },
  {
    id: 'cheeseburger-fries',
    name: 'Classic Bacon Cheeseburger & Fries',
    category: 'Lunch / Fast Food',
    description: 'Double beef patty cheeseburger with bacon, brioche bun, mayo sauce, and deep-fried salted French fries.',
    thumbnail: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    calories: 1180,
    reductionPotential: 520,
    result: {
      id: 'sample-2',
      timestamp: new Date().toISOString(),
      mealName: 'Double Cheeseburger & French Fries',
      overallDescription: 'Heavy restaurant burger meal high in saturated fat from deep frying, processed meat, and butter-toasted brioche.',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      items: [
        {
          id: 'item-1',
          name: 'Double Bacon Cheeseburger',
          category: 'composite',
          estimatedWeightGrams: 280,
          originalWeightGrams: 280,
          servingDescription: '1 double beef burger with cheddar & brioche',
          confidenceScore: 97,
          macros: {
            calories: 780,
            proteinGrams: 42,
            carbsGrams: 48,
            fatGrams: 46,
            fiberGrams: 2,
            sugarGrams: 9,
            saturatedFatGrams: 19,
            sodiumMg: 1540
          },
          per100g: {
            calories: 278,
            proteinGrams: 15,
            carbsGrams: 17.1,
            fatGrams: 16.4,
            fiberGrams: 0.7,
            sugarGrams: 3.2,
            saturatedFatGrams: 6.8,
            sodiumMg: 550
          },
          boundingBox: { top: 20, left: 15, width: 50, height: 65 },
          notes: '80/20 ground beef, cheddar slices, heavy mayonnaise secret sauce.'
        },
        {
          id: 'item-2',
          name: 'Deep Fried French Fries',
          category: 'carbohydrate',
          estimatedWeightGrams: 140,
          originalWeightGrams: 140,
          servingDescription: '1 medium side (approx. 140g)',
          confidenceScore: 95,
          macros: {
            calories: 400,
            proteinGrams: 4,
            carbsGrams: 52,
            fatGrams: 20,
            fiberGrams: 4,
            sugarGrams: 0.5,
            saturatedFatGrams: 3.5,
            sodiumMg: 420
          },
          per100g: {
            calories: 285,
            proteinGrams: 2.8,
            carbsGrams: 37.1,
            fatGrams: 14.3,
            fiberGrams: 2.8,
            sugarGrams: 0.35,
            saturatedFatGrams: 2.5,
            sodiumMg: 300
          },
          boundingBox: { top: 25, left: 60, width: 35, height: 55 },
          notes: 'Standard vegetable oil deep-fried potatoes.'
        }
      ],
      totalMacros: {
        calories: 1180,
        proteinGrams: 46,
        carbsGrams: 100,
        fatGrams: 66,
        fiberGrams: 6,
        sugarGrams: 9.5,
        saturatedFatGrams: 22.5,
        sodiumMg: 1960
      },
      healthRating: {
        score: 3.0,
        nutriGrade: 'E',
        glycemicIndex: 'High',
        calorieDensity: 'Very High (>5 kcal/g)',
        positives: ['Very high protein content (46g)', 'Rich in bioavailable iron and B12'],
        concerns: ['Excessive saturated fat and sodium', 'Heavy oil absorption from deep-frying']
      },
      reductionSuggestions: [
        {
          id: 'swap-1',
          title: 'Air-Fry / Oven Roast Seasoned Potato Wedges with Spray Oil',
          category: 'cooking_method',
          caloriesSaved: 180,
          fatSavedGrams: 14,
          applied: false,
          explanation: 'Switching from submerged deep fryer to air-fried spiced wedges drops fat calories by 70% while keeping crispy potato texture.',
          howToApply: 'Toss potato wedges in smoked paprika, garlic, and 1 tsp olive oil spray; air-fry at 200°C for 18 mins.',
          flavorImpact: 'Virtually identical',
          difficulty: 'Quick Swap'
        },
        {
          id: 'swap-2',
          title: 'Swap Brioche Bun for Sourdough or Lettuce Wrap & Light Mustard Mayo',
          category: 'ingredient_swap',
          caloriesSaved: 160,
          carbsSavedGrams: 22,
          fatSavedGrams: 8,
          applied: false,
          explanation: 'Brioche buns are heavily enriched with butter and sugar. A toasted rustic roll or open-faced bun with Dijon mustard cuts dense empty carbs.',
          howToApply: 'Use a single slice toasted artisan bread or crisp butterhead lettuce cups with Dijon mustard.',
          flavorImpact: 'Mild difference',
          difficulty: 'Super Easy'
        },
        {
          id: 'swap-3',
          title: 'Use 93/7 Lean Ground Beef & 1 Slice Sharp Aged Cheese',
          category: 'ingredient_swap',
          caloriesSaved: 180,
          fatSavedGrams: 16,
          applied: false,
          explanation: '93% lean beef with a strong extra sharp cheddar provides the same intense savory depth with far less grease.',
          howToApply: 'Form patties with 93% lean beef seasoned with Worcestershire sauce and black pepper.',
          flavorImpact: 'Rich & lighter',
          difficulty: 'Cooking Adjustment'
        }
      ],
      reducedPreset: {
        recipeTitle: 'Gourmet Lean Smash Burger & Air-Fried Crispy Wedges',
        summary: 'Savory 93% lean beef patties with Dijon relish and golden air-fried rosemary wedges, slashing 520 calories.',
        totalCalories: 660,
        originalCalories: 1180,
        calorieSavingsTotal: 520,
        percentageSaved: 44,
        macros: {
          calories: 660,
          proteinGrams: 48,
          carbsGrams: 64,
          fatGrams: 22,
          fiberGrams: 7
        },
        keyTechniques: [
          'Swapped deep-fried fries for air-fried seasoned wedges (-180 kcal)',
          'Used 93/7 lean ground beef (-180 kcal)',
          'Replaced buttery brioche with lightly toasted rustic sourdough (-160 kcal)'
        ]
      },
      portionEstimateNotes: 'Estimated based on standard fast-casual portion sizes (quarter pounder base).'
    }
  },
  {
    id: 'salmon-quinoa-bowl',
    name: 'Grilled Salmon & Avocado Quinoa Bowl',
    category: 'Balanced / Mediterranean',
    description: 'Pan-seared Atlantic salmon fillet over warm quinoa, diced ripe avocado, steamed broccoli, and sesame tahini dressing.',
    thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    calories: 680,
    reductionPotential: 220,
    result: {
      id: 'sample-3',
      timestamp: new Date().toISOString(),
      mealName: 'Salmon & Avocado Quinoa Superbowl',
      overallDescription: 'Nutrient-rich whole-food meal with healthy omega-3 fats, but high calorie density from avocado and tahini dressing.',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      items: [
        {
          id: 'item-1',
          name: 'Grilled Salmon Fillet',
          category: 'protein',
          estimatedWeightGrams: 160,
          originalWeightGrams: 160,
          servingDescription: '1 medium fillet (approx. 160g)',
          confidenceScore: 98,
          macros: {
            calories: 330,
            proteinGrams: 34,
            carbsGrams: 0,
            fatGrams: 20,
            fiberGrams: 0,
            sugarGrams: 0,
            saturatedFatGrams: 4,
            sodiumMg: 110
          },
          per100g: {
            calories: 206,
            proteinGrams: 21.2,
            carbsGrams: 0,
            fatGrams: 12.5,
            fiberGrams: 0,
            sugarGrams: 0,
            saturatedFatGrams: 2.5,
            sodiumMg: 68
          },
          boundingBox: { top: 20, left: 30, width: 40, height: 35 },
          notes: 'Wild Atlantic salmon seared with light olive oil.'
        },
        {
          id: 'item-2',
          name: 'Cooked Quinoa',
          category: 'carbohydrate',
          estimatedWeightGrams: 150,
          originalWeightGrams: 150,
          servingDescription: '1 cup cooked quinoa',
          confidenceScore: 93,
          macros: {
            calories: 180,
            proteinGrams: 6,
            carbsGrams: 32,
            fatGrams: 3,
            fiberGrams: 4,
            sugarGrams: 1,
            saturatedFatGrams: 0.3,
            sodiumMg: 10
          },
          per100g: {
            calories: 120,
            proteinGrams: 4,
            carbsGrams: 21.3,
            fatGrams: 2,
            fiberGrams: 2.6,
            sugarGrams: 0.6,
            saturatedFatGrams: 0.2,
            sodiumMg: 7
          },
          boundingBox: { top: 45, left: 15, width: 35, height: 40 },
          notes: 'Fluffy whole grain quinoa.'
        },
        {
          id: 'item-3',
          name: 'Diced Avocado & Tahini Dressing',
          category: 'fat_oil',
          estimatedWeightGrams: 60,
          originalWeightGrams: 60,
          servingDescription: '1/2 medium avocado + 1 tbsp tahini',
          confidenceScore: 91,
          macros: {
            calories: 170,
            proteinGrams: 3,
            carbsGrams: 8,
            fatGrams: 16,
            fiberGrams: 5,
            sugarGrams: 1,
            saturatedFatGrams: 2.5,
            sodiumMg: 95
          },
          per100g: {
            calories: 283,
            proteinGrams: 5,
            carbsGrams: 13.3,
            fatGrams: 26.6,
            fiberGrams: 8.3,
            sugarGrams: 1.6,
            saturatedFatGrams: 4.1,
            sodiumMg: 158
          },
          boundingBox: { top: 30, left: 60, width: 30, height: 40 },
          notes: 'Healthy monounsaturated fats.'
        }
      ],
      totalMacros: {
        calories: 680,
        proteinGrams: 43,
        carbsGrams: 40,
        fatGrams: 39,
        fiberGrams: 9,
        sugarGrams: 2,
        saturatedFatGrams: 6.8,
        sodiumMg: 215
      },
      healthRating: {
        score: 8.8,
        nutriGrade: 'A',
        glycemicIndex: 'Low',
        calorieDensity: 'Moderate (1.5-3 kcal/g)',
        positives: ['Exceptional Omega-3 fatty acids', 'High natural dietary fiber (9g)', 'Low glycemic index whole grains'],
        concerns: ['Fats add up quickly if managing strict cutting calorie budget']
      },
      reductionSuggestions: [
        {
          id: 'swap-1',
          title: 'Lighten Dressing with Lemon-Garlic Herb Vinaigrette',
          category: 'sauce_modifier',
          caloriesSaved: 90,
          fatSavedGrams: 10,
          applied: false,
          explanation: 'Replacing heavy tahini with fresh lemon juice, Dijon, and a mist of EVOO drops 90 kcal while brightening the salmon flavor.',
          howToApply: 'Whisk 2 tbsp fresh lemon juice + 1 tsp Dijon mustard + pinch of sea salt + 1/2 tsp olive oil.',
          flavorImpact: 'Fresh & crisp twist',
          difficulty: 'Super Easy'
        },
        {
          id: 'swap-2',
          title: '50/50 Quinoa & Riced Cauliflower Blend',
          category: 'portion_tweak',
          caloriesSaved: 80,
          carbsSavedGrams: 14,
          fiberGrams: 2,
          applied: false,
          explanation: 'Mixing steamed cauliflower rice with warm quinoa preserves the exact same bowl volume with half the carbohydrate load.',
          howToApply: 'Mix 75g cooked quinoa with 100g sauteed cauliflower rice.',
          flavorImpact: 'Virtually identical',
          difficulty: 'Quick Swap'
        },
        {
          id: 'swap-3',
          title: 'Portion Control: 1/4 Avocado Instead of 1/2',
          category: 'portion_tweak',
          caloriesSaved: 50,
          fatSavedGrams: 5,
          applied: false,
          explanation: '30g of avocado delivers creamy texture and healthy fats with 50 fewer calories.',
          howToApply: 'Slice 1/4 ripe avocado over the bowl.',
          flavorImpact: 'Virtually identical',
          difficulty: 'Super Easy'
        }
      ],
      reducedPreset: {
        recipeTitle: 'Lean Superfood Salmon & Cauliflower Quinoa Bowl',
        summary: 'High-protein, heart-healthy salmon bowl maintaining 43g protein while cutting 220 calories through smart grain & dressing volume tweaks.',
        totalCalories: 460,
        originalCalories: 680,
        calorieSavingsTotal: 220,
        percentageSaved: 32,
        macros: {
          calories: 460,
          proteinGrams: 42,
          carbsGrams: 26,
          fatGrams: 24,
          fiberGrams: 9
        },
        keyTechniques: [
          'Substituted tahini for fresh lemon herb drizzle (-90 kcal)',
          'Blended quinoa with riced cauliflower for high-volume fiber (-80 kcal)',
          'Optimized avocado serving (-50 kcal)'
        ]
      },
      portionEstimateNotes: 'Measured using standard bowl volume (approx. 500ml total volume).'
    }
  },
  {
    id: 'creamy-fettuccine-alfredo',
    name: 'Creamy Chicken Fettuccine Alfredo',
    category: 'Italian / Pasta',
    description: 'Egg fettuccine pasta tossed in rich parmesan heavy cream sauce topped with grilled chicken breast and garlic bread.',
    thumbnail: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80',
    calories: 1040,
    reductionPotential: 540,
    result: {
      id: 'sample-4',
      timestamp: new Date().toISOString(),
      mealName: 'Chicken Alfredo Pasta with Garlic Toast',
      overallDescription: 'High calorie traditional pasta dish driven by heavy dairy fats, butter, and refined wheat flour.',
      imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80',
      items: [
        {
          id: 'item-1',
          name: 'Fettuccine in Heavy Cream Alfredo',
          category: 'composite',
          estimatedWeightGrams: 320,
          originalWeightGrams: 320,
          servingDescription: 'Large bowl pasta with cream sauce',
          confidenceScore: 97,
          macros: {
            calories: 690,
            proteinGrams: 18,
            carbsGrams: 72,
            fatGrams: 38,
            fiberGrams: 3,
            sugarGrams: 4,
            saturatedFatGrams: 22,
            sodiumMg: 890
          },
          per100g: {
            calories: 215,
            proteinGrams: 5.6,
            carbsGrams: 22.5,
            fatGrams: 11.8,
            fiberGrams: 0.9,
            sugarGrams: 1.2,
            saturatedFatGrams: 6.8,
            sodiumMg: 278
          },
          boundingBox: { top: 25, left: 15, width: 60, height: 60 },
          notes: 'Heavy whipping cream, butter, parmesan cheese, refined flour pasta.'
        },
        {
          id: 'item-2',
          name: 'Grilled Chicken Breast Slices',
          category: 'protein',
          estimatedWeightGrams: 120,
          originalWeightGrams: 120,
          servingDescription: 'Skinless sliced chicken breast',
          confidenceScore: 95,
          macros: {
            calories: 190,
            proteinGrams: 35,
            carbsGrams: 0,
            fatGrams: 4.5,
            fiberGrams: 0,
            sugarGrams: 0,
            saturatedFatGrams: 1,
            sodiumMg: 240
          },
          per100g: {
            calories: 158,
            proteinGrams: 29.1,
            carbsGrams: 0,
            fatGrams: 3.75,
            fiberGrams: 0,
            sugarGrams: 0,
            saturatedFatGrams: 0.8,
            sodiumMg: 200
          },
          boundingBox: { top: 20, left: 35, width: 40, height: 35 },
          notes: 'Lean protein source.'
        },
        {
          id: 'item-3',
          name: 'Buttered Garlic Baguette',
          category: 'carbohydrate',
          estimatedWeightGrams: 50,
          originalWeightGrams: 50,
          servingDescription: '1 thick slice garlic bread',
          confidenceScore: 92,
          macros: {
            calories: 160,
            proteinGrams: 3.5,
            carbsGrams: 20,
            fatGrams: 8,
            fiberGrams: 1,
            sugarGrams: 1,
            saturatedFatGrams: 4.5,
            sodiumMg: 310
          },
          per100g: {
            calories: 320,
            proteinGrams: 7,
            carbsGrams: 40,
            fatGrams: 16,
            fiberGrams: 2,
            sugarGrams: 2,
            saturatedFatGrams: 9,
            sodiumMg: 620
          },
          boundingBox: { top: 15, left: 70, width: 25, height: 30 },
          notes: 'White bread coated with garlic butter spread.'
        }
      ],
      totalMacros: {
        calories: 1040,
        proteinGrams: 56.5,
        carbsGrams: 92,
        fatGrams: 50.5,
        fiberGrams: 4,
        sugarGrams: 5,
        saturatedFatGrams: 27.5,
        sodiumMg: 1440
      },
      healthRating: {
        score: 4.2,
        nutriGrade: 'D',
        glycemicIndex: 'High',
        calorieDensity: 'High (3-5 kcal/g)',
        positives: ['Great lean protein foundation from chicken breast', 'High calcium'],
        concerns: ['High saturated dairy fat', 'Heavy refined simple carbs with low fiber']
      },
      reductionSuggestions: [
        {
          id: 'swap-1',
          title: 'Make Sauce with Blended Cottage Cheese / Silken Tofu & Garlic',
          category: 'ingredient_swap',
          caloriesSaved: 260,
          fatSavedGrams: 26,
          proteinDifferenceGrams: 14,
          applied: false,
          explanation: 'Blending low-fat cottage cheese with warm garlic, nutritional yeast, and pasta water creates an ultra-velvety Alfredo sauce with 70% fewer calories and massive protein boost.',
          howToApply: 'Blend 1/2 cup low-fat cottage cheese + 2 tbsp grated parmesan + garlic clove + splash of warm pasta water until silky smooth.',
          flavorImpact: 'Rich & lighter',
          difficulty: 'Cooking Adjustment'
        },
        {
          id: 'swap-2',
          title: '50/50 Pasta & Zucchini Ribbons (Zoodles)',
          category: 'portion_tweak',
          caloriesSaved: 140,
          carbsSavedGrams: 28,
          fiberGrams: 3,
          applied: false,
          explanation: 'Mixing spiralized zucchini ribbons with real fettuccine retains the authentic chew while cutting half the dense starch.',
          howToApply: 'Saute spiralized zucchini for 90 seconds and toss directly with al dente fettuccine.',
          flavorImpact: 'Fresh & crisp twist',
          difficulty: 'Quick Swap'
        },
        {
          id: 'swap-3',
          title: 'Swap Garlic Butter Bread for Roasted Garlic Steamed Broccoli',
          category: 'side_swap',
          caloriesSaved: 140,
          carbsSavedGrams: 15,
          fiberGrams: 4,
          applied: false,
          explanation: 'Garlic broccoli delivers the beloved roasted garlic aroma and crunch with vitamins K & C instead of refined butter bread.',
          howToApply: 'Toss steamed broccoli florets in minced garlic, lemon juice, and black pepper.',
          flavorImpact: 'Fresh & crisp twist',
          difficulty: 'Super Easy'
        }
      ],
      reducedPreset: {
        recipeTitle: 'High-Protein Velvet Chicken Alfredo & Garlic Greens',
        summary: 'Creamy high-protein Alfredo made with whipped cottage cheese & parmesan, zoodle blend, and garlic broccoli, saving 540 calories.',
        totalCalories: 500,
        originalCalories: 1040,
        calorieSavingsTotal: 540,
        percentageSaved: 52,
        macros: {
          calories: 500,
          proteinGrams: 64,
          carbsGrams: 45,
          fatGrams: 12,
          fiberGrams: 8
        },
        keyTechniques: [
          'Swapped heavy whipping cream for blended high-protein cottage cheese emulsion (-260 kcal)',
          'Replaced half pasta with zucchini ribbons for voluminous fiber (-140 kcal)',
          'Replaced garlic butter toast with roasted garlic tenderstem broccoli (-140 kcal)'
        ]
      },
      portionEstimateNotes: 'Pasta volume estimated at standard 1.5 cup restaurant pasta bowl.'
    }
  }
];
