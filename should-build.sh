
#!/bin/bash

echo "ENV: $NEXT_PUBLIC_ENV"

if [[ "$NEXT_PUBLIC_ENV" == "production" ]] || [[ "$NEXT_PUBLIC_ENV" == "preview" ]] ; then
  # Proceed with the build
  echo "✅ - Build can proceed"
  exit 1;

else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi
