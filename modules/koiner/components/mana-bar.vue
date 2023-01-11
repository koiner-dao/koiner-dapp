<template>
  <div
    :class="`mana-bar mana-bar-${size}`"
  >
    <button class="glowing-btn">
      <span
        class="charging-bg"
        :style="`opacity: ${70 + accountStore.manaChargedPercentage * 0.3}%`"
      ></span>
      <span class="glowing-txt"
        >{{ accountStore.manaChargedPercentage
        }}<span class="faulty-letter">%</span></span
      >
      <q-tooltip
        class="bg-accent text-white shadow-4"
        :offset="[0, 30]"
        :hide-delay="3000"
      >
        <div
          class="q-pa-sm q-gutter-xs"
          style="color: rgba(255, 255, 255, 0.8)"
        >
          <div class="row q-gutter-xs">
            <div class="col">
              <span style="opacity: 0.75"
                >Last updated:
                {{ timeAgo(accountStore.onChainBalances[0].lastUpdated) }}</span
              >
            </div>
          </div>
          <div
            class="row q-gutter-xs"
            v-for="(balance, index) in accountStore.onChainBalances"
            :key="index"
          >
            <div class="col" :style="`min-width: 220px;`">
              {{ balance.addressId }}
              <br />{{ balance.charged.toFixed(0) }}%
              <span style="opacity: 0.3">charged </span>
              <span v-if="balance.charged < 100">
                -
                {{ balance.manaRechargeFormatted }}
                <span style="opacity: 0.3">regen time</span>
              </span>
            </div>
            <div class="col" style="min-width: 80px">
              <span>{{ balance.balance.toFixed(2) }}</span
              ><span style="opacity: 0.3"> KOIN</span> <br /><span>{{
                balance.mana.toFixed(2)
              }}</span>
              <span style="opacity: 0.3"> Mana</span>
            </div>
          </div>
        </div>
      </q-tooltip>
    </button>
  </div>
</template>

<style lang="scss">
:root {
  --glow-color: hsl(291, 64%, 42%);
  --glow-text-color: hsl(0, 0%, 100%);
}

.mana-bar {
  position: relative;

  &.mana-bar-sm {
    .glowing-btn {
      font-size: 0.75rem !important;
      padding: 0.05rem 1rem;
      letter-spacing: 0.75rem;
    }
  }

  &.mana-bar-lg {
    .glowing-btn {
      font-size: 0.75rem !important;
      padding: 0.05rem 1rem;
      letter-spacing: 0.75rem;
    }
  }

  .glowing-btn {
    min-width: 102px;
    height: 24px;
    position: relative;
    color: var(--glow-color);
    cursor: pointer;
    border: 0.15rem solid var(--glow-color);
    border-radius: 0.45rem;
    background: none;
    perspective: 2rem;
    font-family: 'Roboto Mono', serif !important;
    font-weight: 900;

    @media screen and (min-width: 1024px) {
      letter-spacing: 0.5rem;
    }

    -webkit-box-shadow: inset 0 0 0.5em 0 var(--glow-color),
      0 0 0.5em 0 var(--glow-color);
    -moz-box-shadow: inset 0 0 0.5em 0 var(--glow-color),
      0 0 0.5em 0 var(--glow-color);
    box-shadow: inset 0 0 0.5em 0 var(--glow-color),
      0 0 0.5em 0 var(--glow-color);
    animation: border-flicker 2s linear infinite;
  }

  .charging-bg {
    background: var(--glow-color);
    border-radius: 0.45rem;
    display: block;
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    position: absolute;
    top: -2px;
    right: -2px;
    bottom: -2px;
    left: -2px;
  }

  .glowing-txt {
    position: absolute;
    line-height: 1;
    padding-top: 0.25rem;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    color: var(--glow-text-color);
    margin-right: -0.8rem;
    -webkit-text-shadow: 0 0 0.125rem hsl(0 0% 100% / 0.3),
      0 0 0.45rem var(--glow-text-color);
    -moz-text-shadow: 0 0 0.125em hsl(0 0% 100% / 0.3),
      0 0 0.45rem var(--glow-text-color);
    text-shadow: 0 0 0.125rem hsl(0 0% 100% / 0.3),
      0 0 0.45rem var(--glow-text-color);
    animation: text-flicker 30s linear infinite;
  }

  .faulty-letter {
    opacity: 0.5;
    animation: faulty-flicker 20s linear infinite;
  }

  .glowing-btn::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0.7;
    filter: blur(1rem);
    transform: translateY(120%) rotateX(95deg) scale(1, 0.35);
    background: var(--glow-color);
    pointer-events: none;
  }

  .glowing-btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    z-index: -1;
    background-color: var(--glow-color);
    box-shadow: 0 0 2rem 0.2rem var(--glow-color);
    transition: opacity 100ms linear;
  }

  .glowing-btn:hover {
    color: rgba(0, 0, 0, 0.8);
    text-shadow: none;
    animation: none;
  }

  .glowing-btn:hover .glowing-txt {
    animation: none;
  }

  .glowing-btn:hover .faulty-letter {
    animation: none;
    text-shadow: none;
    opacity: 1;
  }

  .glowing-btn:hover:before {
    filter: blur(1.5rem);
    opacity: 1;
  }

  .glowing-btn:hover:after {
    opacity: 1;
  }
}

@keyframes faulty-flicker {
  0% {
    opacity: 0.1;
  }
  2% {
    opacity: 0.1;
  }
  4% {
    opacity: 0.5;
  }
  19% {
    opacity: 0.5;
  }
  21% {
    opacity: 0.1;
  }
  23% {
    opacity: 1;
  }
  80% {
    opacity: 0.5;
  }
  83% {
    opacity: 0.4;
  }

  87% {
    opacity: 1;
  }
}

@keyframes text-flicker {
  0% {
    opacity: 0.1;
  }

  2% {
    opacity: 1;
  }

  8% {
    opacity: 0.1;
  }

  9% {
    opacity: 1;
  }

  12% {
    opacity: 0.1;
  }
  20% {
    opacity: 1;
  }
  25% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }

  70% {
    opacity: 0.7;
  }
  72% {
    opacity: 0.2;
  }

  77% {
    opacity: 0.9;
  }
  100% {
    opacity: 0.9;
  }
}

@keyframes border-flicker {
  0% {
    opacity: 0.8;
  }
  8% {
    opacity: 1;
  }
  70% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

@media only screen and (max-width: 600px) {
  .glowing-btn {
    font-size: 1em;
  }
}
</style>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from 'stores/account';
import { formattedTokenAmount, timeAgo } from '../utils';

export default defineComponent({
  name: 'ManaBar',
  methods: { timeAgo, formattedTokenAmount },
  props: {
    size: {
      required: false,
      type: String as PropType<'sm' | 'lg'>,
      default: 'lg',
    },
  },

  setup() {
    const accountStore = useAccountStore();

    return {
      accountStore,
    };
  },
});
</script>