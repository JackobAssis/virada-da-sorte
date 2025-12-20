#!/bin/bash

# Script para renomear imagens de cartas
# Formato: [estilo]-card-[numero].png

echo "🎴 Renomeando imagens de cartas..."

# Função para renomear pasta
rename_folder() {
    local folder=$1
    local prefix=$2
    
    echo "📁 Processando: $folder"
    cd "/home/kali-jackob/Área de trabalho/Arquivos DEV/virada-da-sorte/public/images/$folder"
    
    # Renomear Image_fx.png para [prefix]-card-01.png
    if [ -f "Image_fx.png" ]; then
        mv "Image_fx.png" "${prefix}-card-01.png"
        echo "  ✓ ${prefix}-card-01.png"
    fi
    
    # Renomear Image_fx (1).png até Image_fx (20).png
    for i in {1..20}; do
        if [ -f "Image_fx ($i).png" ]; then
            # Formatar número com 2 dígitos
            num=$(printf "%02d" $((i + 1)))
            mv "Image_fx ($i).png" "${prefix}-card-${num}.png"
            echo "  ✓ ${prefix}-card-${num}.png"
        fi
    done
}

# Renomear cada pasta
rename_folder "Personagens" "personagem"
rename_folder "Animais" "animal"
rename_folder "Simbolos" "simbolo"
rename_folder "Cyber" "cyber"
rename_folder "Dark" "dark"

echo ""
echo "✅ Renomeação concluída!"
echo ""
echo "Nova estrutura:"
echo "  personagem-card-01.png até personagem-card-21.png"
echo "  animal-card-01.png até animal-card-21.png"
echo "  simbolo-card-01.png até simbolo-card-21.png"
echo "  cyber-card-01.png até cyber-card-21.png"
echo "  dark-card-01.png até dark-card-21.png"
