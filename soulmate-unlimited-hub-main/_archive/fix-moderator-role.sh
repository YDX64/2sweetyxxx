#!/bin/bash

echo "🔧 Fixing moderator role assignment issue..."

# Apply the moderator permissions migration
echo "📄 Applying moderator permissions migration..."
npm run db:push

echo "✅ Migration applied successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Try assigning moderator role again from admin panel"
echo ""
echo "📝 Note: Make sure you're logged in as an admin user to assign roles"