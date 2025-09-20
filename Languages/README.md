# Language Learning Projects

This directory contains interactive language learning applications for Japanese and Slovak.

## Structure

- **Japanese/** - Japanese language learning apps with Japanese flag background
- **Slovak/** - Slovak language learning apps with Slovak coat of arms background
- **Main Directory** - Flag selection page with hover glow effects and responsive design

## Auto-Update System

Each language directory has its own auto-updating index.html that:

- Automatically scans for new language learning projects
- Maintains the original flag/coat of arms styling
- Uses proper project naming conventions
- Preserves the card-based layout

### Japanese Projects
- **Background**: Japanese flag (red circle on white)
- **Projects**: Numbers, Time, Calendar, Prepositions, HiraganaDrop, KanjiDrop
- **Naming**: "Japanese [Project] TranslaSean"
- **Hover Effect**: Red glow text (#ff0000) with red border

### Slovak Projects  
- **Background**: Slovak flag (white/blue/red stripes) + coat of arms SVG
- **Projects**: Numbers, Time, Calendar, Prepositions
- **Naming**: "Slovak [Project] TranslaSean"
- **Hover Effect**: Blue glow text (#0066ff) with blue border

## Manual Updates

```bash
# Update Japanese index only
cd Languages/Japanese && ./update-japanese-index.sh

# Update Slovak index only  
cd Languages/Slovak && ./update-slovak-index.sh

# Update both language indexes
cd Languages && ./update-languages-index.sh

# Update everything (main script calls language updates automatically)
./update-index.sh
```

## Automatic Updates

The indexes are automatically updated when:
1. The main portfolio update script runs
2. Changes are pushed to the repository (via GitHub Action)
3. New language learning projects are added

## Adding New Projects

When adding new language learning projects:

1. **Create a new directory** in `Languages/Japanese/` or `Languages/Slovak/`
2. **Add an `index.html`** file to make it discoverable
3. **Update project mappings** in the respective update script if you want custom names
4. The index will automatically update on the next script run

### Custom Project Names

Edit the `project_names` array in the update scripts:

```bash
# In update-japanese-index.sh or update-slovak-index.sh
project_names["YourNewProject"]="Japanese Your New Project TranslaSean"
```

## Styling Preservation

The auto-update scripts preserve:
- ✅ Original flag/coat of arms backgrounds
- ✅ Card-based layout with clean white cards and black borders
- ✅ Responsive design for mobile devices
- ✅ Hover effects with subtle animations and glow text
- ✅ Black text on white background for better readability
- ✅ Red glow effects for Japanese (🇯🇵) and blue glow for Slovak (🇸🇰)
- ✅ Sharp text with glow effects using pseudo-elements for better readability
- ✅ Large, prominent flags with responsive design for mobile devices
- ✅ Vertical stacking on smaller screens (768px and below)
- ✅ Proper project naming conventions