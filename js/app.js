function getBasePath() {
  const { pathname } = window.location;

  if (pathname.endsWith("/")) {
    return pathname;
  }

  const lastSlash = pathname.lastIndexOf("/");
  const lastSegment = pathname.slice(lastSlash + 1);

  if (lastSegment.includes(".")) {
    return pathname.slice(0, lastSlash + 1);
  }

  return `${pathname}/`;
}

function assetUrl(relativePath) {
  return new URL(relativePath.replace(/^\.\//, ""), `${window.location.origin}${getBasePath()}`).href;
}

const DATA_URL = assetUrl("./resume-data.json");

function hasValue(value) {
  if (value == null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderRichText(text) {
  if (!hasValue(text)) {
    return "";
  }

  return String(text)
    .split(/(\*\*.+?\*\*)/g)
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
      }
      return escapeHtml(part);
    })
    .join("");
}

function formatEntryTitle({ company, role, team, institution, degree }) {
  if (institution) {
    return [institution, degree].filter(hasValue).join(" - ");
  }

  const parts = [company, role, team].filter(hasValue);
  return parts.join(" - ");
}

function renderLink({ label, href, url, fullLabel }) {
  const linkLabel = label || href || url;
  const linkHref = href || url;
  if (!hasValue(linkLabel) || !hasValue(linkHref)) {
    return "";
  }
  const full = fullLabel || linkHref;
  return `<a href="${escapeHtml(linkHref)}" target="_blank" rel="noopener noreferrer"><span class="link-short">${escapeHtml(linkLabel)}</span><span class="link-full">${escapeHtml(full)}</span></a>`;
}

function renderHighlights(items, className = "entry__list") {
  const highlights = items?.filter(hasValue) ?? [];
  if (!highlights.length) {
    return "";
  }
  const listItems = highlights.map((item) => `<li>${renderRichText(item)}</li>`).join("");
  return `<ul class="${className}">${listItems}</ul>`;
}

function renderJobTitleDesktop({ company, role, team }) {
  const rolePart = [role, team].filter(hasValue).join(" - ");
  const companyPrefix = hasValue(company) ? `<strong>${escapeHtml(company)} - </strong>` : "";

  if (!hasValue(rolePart)) {
    return companyPrefix.replace(/ - <\/strong>$/, "</strong>");
  }

  return `${companyPrefix}<span class="entry__title-regular">${escapeHtml(rolePart)}</span>`;
}

function renderEntryHeader({ company, role, team, institution, degree, period }) {
  const periodHtml = hasValue(period)
    ? `<p class="entry__period">${escapeHtml(period)}</p>`
    : "";

  if (institution) {
    const fullTitle = formatEntryTitle({ institution, degree });
    const roleLine = hasValue(degree) ? `<p class="entry__role">${escapeHtml(degree)}</p>` : "";

    return `
      <div class="entry__header">
        <div class="entry__meta">
          <h3 class="entry__company">${escapeHtml(institution)}</h3>
          ${roleLine}
        </div>
        ${hasValue(fullTitle) ? `<h3 class="entry__title entry__title--desktop"><strong>${escapeHtml(fullTitle)}</strong></h3>` : ""}
        ${periodHtml}
      </div>
    `;
  }

  const roleParts = [role, team].filter(hasValue);
  const roleLine = roleParts.length
    ? `<p class="entry__role">${escapeHtml(roleParts.join(" · "))}</p>`
    : "";
  const companyHtml = hasValue(company)
    ? `<h3 class="entry__company">${escapeHtml(company)}</h3>`
    : "";
  const desktopTitle = renderJobTitleDesktop({ company, role, team });

  return `
    <div class="entry__header">
      <div class="entry__meta">
        ${companyHtml}
        ${roleLine}
      </div>
      ${hasValue(desktopTitle) ? `<h3 class="entry__title entry__title--desktop">${desktopTitle}</h3>` : ""}
      ${periodHtml}
    </div>
  `;
}

function renderExperience(experience) {
  if (!hasValue(experience)) {
    return "";
  }

  return experience
    .map(
      (job) => `
        <article class="entry">
          ${renderEntryHeader(job)}
          ${hasValue(job.description) ? `<p class="entry__description">${renderRichText(job.description)}</p>` : ""}
          ${renderHighlights(job.highlights)}
        </article>
      `
    )
    .join("");
}

function renderEducation(education) {
  if (!hasValue(education)) {
    return "";
  }

  return education
    .map(
      (item) => `
        <article class="entry">
          ${renderEntryHeader(item)}
          ${renderHighlights(item.details, "entry__details")}
        </article>
      `
    )
    .join("");
}

function shortLinkLabel(url) {
  if (url.label && url.label !== "Url" && !/^https?:\/\//i.test(url.label)) {
    return url.label;
  }

  try {
    const parsed = new URL(url.href);
    if (parsed.hostname.includes("play.google.com")) {
      return "View on Google Play";
    }
    if (parsed.hostname.includes("linkedin.com")) {
      return "LinkedIn Profile";
    }
    if (parsed.hostname.includes("kompas.com")) {
      return "Read on Kompas";
    }
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.href;
  }
}

function renderProjectLink(url) {
  if (!url || !hasValue(url.href)) {
    return "";
  }

  const label = shortLinkLabel(url);
  const link = renderLink({ label, href: url.href });
  if (!link) {
    return "";
  }

  if (url.label === "Url") {
    return `Url: ${link}`;
  }

  return link;
}

function renderProjects(projects) {
  if (!hasValue(projects)) {
    return "";
  }

  return projects
    .map((project) => {
      const link = project.url ? renderProjectLink(project.url) : "";
      const title = hasValue(project.title)
        ? `<h3 class="entry__title">${escapeHtml(project.title)}</h3>`
        : "";
      const description = hasValue(project.description)
        ? `<p class="entry__description">${renderRichText(project.description)}</p>`
        : "";

      if (!title && !description && !link) {
        return "";
      }

      return `
        <article class="entry">
          ${title}
          ${description}
          ${link ? `<p class="project__link">${link}</p>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderSkills(skills) {
  if (!hasValue(skills)) {
    return "";
  }

  const rows = skills
    .filter((skill) => hasValue(skill.category) && hasValue(skill.items))
    .map(
      (skill) => `
        <div class="skill-row">
          <span class="skill-row__label">${escapeHtml(skill.category)}</span>
          <span class="skill-row__items">${escapeHtml(skill.items)}</span>
        </div>
      `
    )
    .join("");

  if (!rows) {
    return "";
  }

  return `<div class="skills">${rows}</div>`;
}

const CONTACT_ICONS = {
  location: `<svg class="contact-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
  email: `<svg class="contact-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
  phone: `<svg class="contact-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6.6 3.5A2 2 0 0 0 4 5.8c0 11.1 9.1 20.2 20.2 20.2a2 2 0 0 0 2.3-2.6l-1.3-3.2a2 2 0 0 0-1.1-1.1l-3.3-1.3a2 2 0 0 0-2.2.6l-1.3 1.3a16.2 16.2 0 0 1-7.1-7.1l1.3-1.3a2 2 0 0 0 .6-2.2L8.7 6.6a2 2 0 0 0-1.1-1.1L4.4 4.2a2 2 0 0 0-1.8.3z"/></svg>`,
  linkedin: `<svg class="contact-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 11v5M8 8v.01M12 16v-5m0 0a2 2 0 1 1 4 0v5m-4-5a2 2 0 1 0 4 0"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
};

function renderContactItem(type, content) {
  return `<li class="contact-item contact-item--${type}">${CONTACT_ICONS[type] || ""}<span>${content}</span></li>`;
}

function renderContact(personal) {
  const items = [];

  if (hasValue(personal.location)) {
    items.push(renderContactItem("location", escapeHtml(personal.location)));
  }

  if (hasValue(personal.email)) {
    items.push(
      renderContactItem(
        "email",
        `<a href="mailto:${escapeHtml(personal.email)}">${escapeHtml(personal.email)}</a>`
      )
    );
  }

  if (hasValue(personal.phone)) {
    const phoneHref = personal.phone.replace(/\s/g, "");
    items.push(
      renderContactItem(
        "phone",
        `<a href="tel:${escapeHtml(phoneHref)}">${escapeHtml(personal.phone)}</a>`
      )
    );
  }

  if (personal.linkedin && hasValue(personal.linkedin.url)) {
    const link = renderLink({
      label: personal.linkedin.label || "Linkedin",
      href: personal.linkedin.url,
    });
    if (link) {
      items.push(renderContactItem("linkedin", link));
    }
  } else if (personal.linkedin && hasValue(personal.linkedin.label)) {
    items.push(renderContactItem("linkedin", escapeHtml(personal.linkedin.label)));
  }

  if (!items.length) {
    return "";
  }

  return `<ul class="header__contact">${items.join("")}</ul>`;
}

function renderSection(title, content, slug) {
  if (!content?.trim()) {
    return "";
  }

  const sectionClass = slug ? ` section--${slug}` : "";

  return `
    <section class="section${sectionClass}">
      <h2 class="section__title">${escapeHtml(title)}</h2>
      ${content}
    </section>
  `;
}

function renderResume(data) {
  const { personal } = data;
  document.title = hasValue(personal?.name) ? `${personal.name} - Resume` : "Resume";

  const summary = hasValue(data.summary)
    ? `<p class="summary">${renderRichText(data.summary)}</p>`
    : "";

  return `
    <header class="header">
      ${hasValue(personal?.name) ? `<h1 class="header__name">${escapeHtml(personal.name)}</h1>` : ""}
      ${renderContact(personal ?? {})}
      ${summary}
    </header>

    ${renderSection("Professional Experience", renderExperience(data.experience), "experience")}
    ${renderSection("Education", renderEducation(data.education), "education")}
    ${renderSection("Project & Achievements", renderProjects(data.projects), "projects")}
    ${renderSection("Skills", renderSkills(data.skills), "skills")}
  `;
}

async function loadResume() {
  const container = document.getElementById("resume");

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load ${DATA_URL}`);
    }
    const data = await response.json();
    container.innerHTML = renderResume(data);
  } catch (error) {
    container.innerHTML = `<p class="error">Could not load resume data. ${escapeHtml(error.message)}</p>`;
  }
}

document.getElementById("print-btn")?.addEventListener("click", () => {
  window.print();
});

loadResume();
