import { AfterViewInit, Directive, ElementRef, inject, OnDestroy } from '@angular/core';

@Directive({ selector: '[appReveal]' })
export class RevealDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private obs?: IntersectionObserver;
  private timer?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;
    if (!('IntersectionObserver' in window)) return;
    node.classList.add('reveal');
    this.obs = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        node.classList.add('shown');
        this.obs?.disconnect();
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });
    this.obs.observe(node);
    this.timer = setTimeout(() => node.classList.add('shown'), 2200);
  }

  ngOnDestroy(): void {
    this.obs?.disconnect();
    if (this.timer) clearTimeout(this.timer);
  }
}
